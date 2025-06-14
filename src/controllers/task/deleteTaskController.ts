import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { Response } from 'express'
import { findProjectByKey, findTaskByIdAndProject } from '@services/task/TaskServices'
import { AppDataSource } from '@config/connectDatabase'
import { Task } from '@entities/task/Task'
import { ResponseMessages } from '@constants/ResponseMessages'
import { Server } from 'socket.io'
import { WebSocketEvents } from '@constants/WebSocketEvents'

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

        const project = await findProjectByKey(key)
        const task = await findTaskByIdAndProject(taskId, project.id)
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
