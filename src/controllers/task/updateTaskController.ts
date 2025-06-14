import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { Response } from 'express'
import { findBoardColumnById, findProjectByKey, findTaskByIdAndProject } from '@services/task/TaskServices'
import { AppDataSource } from '@config/connectDatabase'
import { Task } from '@entities/task/Task'
import { Server } from 'socket.io'
import { WebSocketEvents } from '@constants/WebSocketEvents'
import { getTaskLightDto } from '@dtos/task/TaskLiteDto'
import { getTaskDetailsDto } from '@dtos/task/TaskDetailsDto'
import { ResponseMessages } from '@constants/ResponseMessages'

/**
 * Met à jour une tache
 * @param req
 * @param res
 */
export const updateTaskController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { key, taskId } = req.params
        const { columnId, title, description, priority, type } = req.body

        if (title !== undefined && (title === null || title.trim() === '')) {
            res.status(400).json({ message: 'Task title cannot be empty.' })
            return
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

        res.status(200).json({ message: 'Task updated', task: getTaskDetailsDto(updatedTask) })
    } catch (error) {
        console.error('Error updating task:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
