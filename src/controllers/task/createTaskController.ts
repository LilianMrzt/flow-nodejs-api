import { Response } from 'express'
import { AppDataSource } from '@config/connectDatabase'
import { ResponseMessages } from '@constants/ResponseMessages'
import { Task } from '@entities/task/Task'
import { Server } from 'socket.io'
import { WebSocketEvents } from '@constants/WebSocketEvents'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { Project } from '@entities/project/Project'
import { getTaskDetailsDto } from '@dtos/task/TaskDetailsDto'
import { getAuthenticatedUserService } from '@services/user/auth/getAuthenticatedUserService'
import { findUserByIdService } from '@services/user/findUserByIdService'
import { findProjectByKeyService } from '@services/project/findProjectByKeyService'
import { findBoardColumnByIdService } from '@services/board-column/findBoardColumnByIdService'
import { getNextOrderInColumnService } from '@services/task/getNextOrderInColumnService'
import { getNextOrderInBacklogService } from '@services/task/getNextOrderInBacklogService'

/**
 * Crée une tâche pour un projet
 * @param req
 * @param res
 */
export const createTaskController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { key } = req.params
        const { title, description, type, priority, columnId, assignedUser } = req.body

        const reporter = await getAuthenticatedUserService(req)
        const projectRepo = AppDataSource.getRepository(Project)
        const project = await findProjectByKeyService(key)

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
        task.column = columnId ? await findBoardColumnByIdService(columnId) : null
        task.assignedUser = assignedUser ? await findUserByIdService(assignedUser) : null
        task.orderInBacklog = await getNextOrderInBacklogService(project.id)

        if (columnId) {
            task.column = await findBoardColumnByIdService(columnId)
            task.orderInColumn = await getNextOrderInColumnService(columnId)
        } else {
            task.column = null
            task.orderInColumn = null
        }

        const savedTask = await AppDataSource.getRepository(Task).save(task)

        const io = req.app.locals.io as Server
        io.to(project.id).emit(WebSocketEvents.TASK_CREATED, getTaskDetailsDto(savedTask))

        res.status(201).json(getTaskDetailsDto(savedTask))
    } catch (error) {
        console.error('Error creating task:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
