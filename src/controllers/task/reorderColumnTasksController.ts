import { Response } from 'express'
import { AppDataSource } from '@config/connectDatabase'
import { ResponseMessages } from '@constants/ResponseMessages'
import { Task } from '@entities/task/Task'
import { Server } from 'socket.io'
import { WebSocketEvents } from '@constants/WebSocketEvents'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import {
    findProjectByKey,
    prepareColumnTasksUpdate,
    reorderTasksInColumn
} from '@services/task/TaskServices'
import { getTaskLightDto } from '@dtos/task/TaskLiteDto'

/**
 * Gère la réorganisation de l'ordre et des colonnes des éléments du tableau
 * @param req
 * @param res
 */
export const reorderColumnTasksController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
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

        res.status(200).json({ message: 'Column reordered' })
    } catch (error) {
        console.error('Error reordering column:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
