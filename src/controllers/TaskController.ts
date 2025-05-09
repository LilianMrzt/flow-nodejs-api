import { Response } from 'express'
import { Project } from '../entities/project/Project'
import { AppDataSource } from '../config/connectDatabase'
import { ResponseMessages } from '../constants/ResponseMessages'
import { Task } from '../entities/task/Task'
import { BoardColumn } from '../entities/board-column/BoardColumn '
import { Server } from 'socket.io'
import { WebSocketEvents } from '../constants/WebSocketEvents'
import { AuthenticatedRequest } from '../middleware/authenticateJWT'
import { User } from '../entities/user/User'

/**
 * Crée une tâche pour un projet
 */
export const createTask = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { slug } = req.params

        const { title, description, type, priority, columnId } = req.body

        const userId = req.user?.userId
        if (!userId) return res.status(401).json({ message: 'Unauthorized: missing user ID' })

        const reporter = await AppDataSource.getRepository(User).findOneBy({ id: userId })
        if (!reporter) return res.status(404).json({ message: 'User not found' })

        const project = await AppDataSource.getRepository(Project).findOne({
            where: { slug },
            relations: ['team']
        })

        if (!project) return res.status(404).json({ message: ResponseMessages.projectNotFound })

        const task = new Task()
        task.title = title
        task.description = description
        task.type = type
        task.priority = priority
        task.reporter = reporter
        task.project = project

        if (columnId) {
            const column = await AppDataSource.getRepository(BoardColumn).findOneBy({ id: columnId })
            if (!column) return res.status(404).json({ message: ResponseMessages.boardColumnNotFound })
            task.column = column
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
