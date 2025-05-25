import { Response } from 'express'
import { AppDataSource } from '../config/connectDatabase'
import { ResponseMessages } from '../constants/ResponseMessages'
import { Task } from '../entities/task/Task'
import { Server } from 'socket.io'
import { WebSocketEvents } from '../constants/WebSocketEvents'
import { AuthenticatedRequest } from '../middleware/authenticateJWT'
import {
    findUserById
} from '../services/user/UserService'
import {
    findBoardColumnById,
    findProjectByKey,
    findTaskByIdAndProject,
    getNextOrderInBacklog,
    getNextOrderInColumn,
    prepareColumnTasksUpdate,
    reorderTasksInColumn
} from '../services/task/TaskServices'
import { In } from 'typeorm'
import { Project } from '../entities/project/Project'
import { getTaskLightDto } from '../dtos/task/TaskLiteDto'
import { getTaskDetailsDto } from '../dtos/task/TaskDetailsDto'

/**
 * Crée une tâche pour un projet
 * @param req
 * @param res
 */
export const createTask = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { key } = req.params
        const { title, description, type, priority, columnId, assignedUser } = req.body

        const reporter = await findUserById(req.user?.userId)
        const projectRepo = AppDataSource.getRepository(Project)
        const project = await findProjectByKey(key)

        project.totalTasksNumber += 1
        await projectRepo.save(project)

        const taskKey = `${project.key.toUpperCase()}-${project.totalTasksNumber}`

        const task = new Task()
        task.title = title
        task.description = description
        task.type = type
        task.priority = priority
        task.key = taskKey
        task.reporter = reporter
        task.project = project
        task.column = columnId ? await findBoardColumnById(columnId) : null
        task.assignedUser = assignedUser ? await findUserById(assignedUser) : null
        task.orderInBacklog = await getNextOrderInBacklog(project.id)

        if (columnId) {
            task.column = await findBoardColumnById(columnId)
            task.orderInColumn = await getNextOrderInColumn(columnId)
        } else {
            task.column = null
            task.orderInColumn = null
        }

        const savedTask = await AppDataSource.getRepository(Task).save(task)

        const io = req.app.locals.io as Server
        io.to(project.id).emit(WebSocketEvents.TASK_CREATED, getTaskDetailsDto(savedTask))

        return res.status(201).json(getTaskDetailsDto(savedTask))
    } catch (error) {
        console.error('Error creating task:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Supprime une tâche d’un projet
 * @param req
 * @param res
 */
export const deleteTask = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { key, taskId } = req.params

        const project = await findProjectByKey(key)
        const task = await findTaskByIdAndProject(taskId, project.id)
        const taskIdBeforeDeletion = task.id

        await AppDataSource.getRepository(Task).remove(task)

        const io = req.app.locals.io as Server
        io.to(project.id).emit(WebSocketEvents.TASK_DELETED, taskIdBeforeDeletion)

        return res.status(200).json({ message: 'Task deleted', taskId: task.id })
    } catch (error) {
        console.error('Error deleting task:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Récupère les tâches d'un projet
 * @param req
 * @param res
 */
export const getTasksByProjectKey = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { key } = req.params
        const project = await findProjectByKey(key)

        const tasks = await AppDataSource.getRepository(Task).find({
            where: { project: { id: project.id } },
            relations: ['column']
        })

        return res.status(200).json(tasks.map(getTaskLightDto))
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Met à jour une tache
 * @param req
 * @param res
 */
export const updateTask = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { key, taskId } = req.params
        const { columnId, title, description, priority, type } = req.body

        if (title !== undefined && (title === null || title.trim() === '')) {
            return res.status(400).json({ message: 'Task title cannot be empty.' })
        }

        const project = await findProjectByKey(key)
        const task = await findTaskByIdAndProject(taskId, project.id)

        if (columnId !== undefined) {
            task.column = columnId ? await findBoardColumnById(columnId) : null
        }
        if (title !== undefined) task.title = title
        if (description !== undefined) task.description = description
        if (priority !== undefined) task.priority = priority
        if (type !== undefined) task.type = type

        const updatedTask = await AppDataSource.getRepository(Task).save(task)

        const io = req.app.locals.io as Server
        io.to(project.id).emit(WebSocketEvents.TASK_UPDATED, getTaskLightDto(updatedTask))

        return res.status(200).json({ message: 'Task updated', task: getTaskDetailsDto(updatedTask) })
    } catch (error) {
        console.error('Error updating task:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Gère la réorganisation de l'ordre des éléments du backlog
 * @param req
 * @param res
 */
export const reorderBacklogTasks = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { key } = req.params
        const { updates }: { updates: { id: string, orderInBacklog: number }[] } = req.body

        const project = await findProjectByKey(key)

        for (const update of updates) {
            await AppDataSource.getRepository(Task).update(
                { id: update.id, project: { id: project.id } },
                { orderInBacklog: update.orderInBacklog }
            )
        }

        const updatedTaskIds = updates.map(update => {
            return update.id
        })
        const updatedTasks = await AppDataSource.getRepository(Task).find({
            where: { id: In(updatedTaskIds) },
            relations: ['column']
        })

        const io = req.app.locals.io as Server
        io.to(project.id).emit(WebSocketEvents.BACKLOG_TASKS_REORDERED, updatedTasks.map(getTaskLightDto))

        return res.status(200).json({ message: 'Backlog reordered' })
    } catch (error) {
        console.error('Error reordering backlog:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Gère la réorganisation de l'ordre et des colonnes des éléments du tableau
 * @param req
 * @param res
 */
export const reorderColumnTasks = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { key } = req.params
        const { updates }: { updates: { id: string, columnId: string | null, orderInColumn: number }[] } = req.body

        const project = await findProjectByKey(key)
        const taskRepo = AppDataSource.getRepository(Task)

        const { tasksToUpdate, columnsToReorder } = await prepareColumnTasksUpdate(updates, project.id)
        await taskRepo.save(tasksToUpdate)

        const reorderedTasks: Task[] = []

        for (const columnId of columnsToReorder) {
            const reordered = await reorderTasksInColumn(project.id, columnId)
            reorderedTasks.push(...reordered)
        }

        const io = req.app.locals.io as Server
        io.to(project.id).emit(WebSocketEvents.BOARD_TASKS_REORDERED, reorderedTasks.map(getTaskLightDto))

        return res.status(200).json({ message: 'Column reordered' })
    } catch (error) {
        console.error('Error reordering column:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Récupère une tâche par sa clé (key) dans un projet
 * @param req
 * @param res
 */
export const getTaskByKey = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { key, taskKey } = req.params

        const project = await findProjectByKey(key)

        const task = await AppDataSource.getRepository(Task).findOne({
            where: {
                key: taskKey,
                project: { id: project.id }
            },
            relations: ['column', 'reporter', 'assignedUser']
        })

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        return res.status(200).json({ task: getTaskDetailsDto(task) })
    } catch (error) {
        console.error('Error fetching task by key:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
