import { Response } from 'express'
import { AppDataSource } from '../config/connectDatabase'
import { ResponseMessages } from '../constants/ResponseMessages'
import { Task } from '../entities/task/Task'
import { Server } from 'socket.io'
import { WebSocketEvents } from '../constants/WebSocketEvents'
import { AuthenticatedRequest } from '../middleware/authenticateJWT'
import { findUserById } from '../services/user/UserService'
import { findBoardColumnById, findProjectBySlug, findTaskByIdAndProject } from '../services/task/TaskServices'

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
        const { slug } = req.params
        const { title, description, type, priority, columnId } = req.body

        const reporter = await findUserById(req.user?.userId)
        const project = await findProjectBySlug(slug)

        const task = new Task()
        task.title = title
        task.description = description
        task.type = type
        task.priority = priority
        task.reporter = reporter
        task.project = project

        if (columnId) {
            task.column = await findBoardColumnById(columnId)
        }

        const savedTask = await AppDataSource.getRepository(Task).save(task)

        const io = req.app.locals.io as Server
        io.to(project.id).emit(WebSocketEvents.TASK_CREATED, savedTask)

        return res.status(201).json(savedTask)
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
        const { slug, taskId } = req.params

        const project = await findProjectBySlug(slug)
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
export const getTasksByProjectSlug = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { slug } = req.params

        const project = await findProjectBySlug(slug)
        const tasks = await AppDataSource.getRepository(Task).find({
            where: { project: { id: project.id } },
            relations: ['column']
        })

        return res.status(200).json(tasks)
    } catch (error) {
        console.error('Error deleting task:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
