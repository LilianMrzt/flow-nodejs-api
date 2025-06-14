import { Response } from 'express'
import { AppDataSource } from '@config/connectDatabase'
import { ResponseMessages } from '@constants/ResponseMessages'
import { Task } from '@entities/task/Task'
import { Server } from 'socket.io'
import { WebSocketEvents } from '@constants/WebSocketEvents'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { findProjectByKey } from '@services/task/TaskServices'
import { In } from 'typeorm'
import { getTaskLightDto } from '@dtos/task/TaskLiteDto'

/**
 * Gère la réorganisation de l'ordre des éléments du backlog
 * @param req
 * @param res
 */
export const reorderBacklogTasksController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
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

        res.status(200).json({ message: 'Backlog reordered' })
    } catch (error) {
        console.error('Error reordering backlog:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
