import { Response } from 'express'
import { AppDataSource } from '@config/connectDatabase'
import { BoardColumn } from '@entities/board-column/BoardColumn'
import { getBoardColumnDto } from '@dtos/board-column/BoardColumnDto'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { findProjectByKey } from '@services/task/TaskServices'

/**
 * Récupère les colonnes d'un projet
 * @param req
 * @param res
 */
export const getColumnsByProjectKeyController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { key } = req.params
        const project = await findProjectByKey(key)

        if (!project) {
            res.status(404).json({ message: 'Project not found' })
            return
        }

        const columns = await AppDataSource.getRepository(BoardColumn).find({
            where: { project: { id: project.id } },
            order: { order: 'ASC' }
        })

        res.status(200).json({
            columns: columns.map(getBoardColumnDto)
        })
    } catch (error) {
        console.error('Error fetching columns:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
