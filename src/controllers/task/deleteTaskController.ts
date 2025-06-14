import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { Response } from 'express'
import { AppDataSource } from '@config/connectDatabase'
import { Task } from '@entities/task/Task'
import { ResponseMessages } from '@constants/ResponseMessages'
import { Server } from 'socket.io'
import { WebSocketEvents } from '@constants/WebSocketEvents'
import { findProjectByKeyService } from '@services/project/findProjectByKeyService'
import { findTaskByIdAndProjectService } from '@services/task/findTaskByIdAndProjectService'

/**
 * Supprime une tâche d’un projet
 * @param req
 * @param res
 */
export const deleteTaskController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { key, taskId } = req.params

        const project = await findProjectByKeyService(key)
        const task = await findTaskByIdAndProjectService(taskId, project.id)
        const taskIdBeforeDeletion = task.id

        await AppDataSource.getRepository(Task).remove(task)

        const io = req.app.locals.io as Server
        io.to(project.id).emit(WebSocketEvents.TASK_DELETED, taskIdBeforeDeletion)

        res.status(200).json({ message: 'Task deleted', taskId: task.id })
    } catch (error) {
        console.error('Error deleting task:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
