import { Response } from 'express'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { findProjectByKey } from '@services/task/TaskServices'
import { AppDataSource } from '@config/connectDatabase'
import { Task } from '@entities/task/Task'
import { getTaskLightDto } from '@dtos/task/TaskLiteDto'
import { ResponseMessages } from '@constants/ResponseMessages'

/**
 * Récupère les tâches d'un projet
 * @param req
 * @param res
 */
export const getTasksByProjectKeyController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { key } = req.params
        const project = await findProjectByKey(key)

        const tasks = await AppDataSource.getRepository(Task).find({
            where: { project: { id: project.id } },
            relations: ['column']
        })

        res.status(200).json(tasks.map(getTaskLightDto))
    } catch (error) {
        console.error('Error fetching tasks:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
