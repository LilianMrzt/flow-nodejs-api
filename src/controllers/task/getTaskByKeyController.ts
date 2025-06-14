import { Response } from 'express'
import { AppDataSource } from '@config/connectDatabase'
import { ResponseMessages } from '@constants/ResponseMessages'
import { Task } from '@entities/task/Task'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { getTaskDetailsDto } from '@dtos/task/TaskDetailsDto'
import { findProjectByKeyService } from '@services/project/findProjectByKeyService'

/**
 * Récupère une tâche par sa clé (key) dans un projet
 * @param req
 * @param res
 */
export const getTaskByKeyController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { key, taskKey } = req.params

        const project = await findProjectByKeyService(key)

        const task = await AppDataSource.getRepository(Task).findOne({
            where: {
                key: taskKey,
                project: { id: project.id }
            },
            relations: ['column', 'reporter', 'assignedUser']
        })

        if (!task) {
            res.status(404).json({ message: 'Task not found' })
            return
        }

        res.status(200).json({ task: getTaskDetailsDto(task) })
    } catch (error) {
        console.error('Error fetching task by key:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
