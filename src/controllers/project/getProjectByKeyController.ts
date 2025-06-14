import { Project } from '@entities/project/Project'
import { AppDataSource } from '@config/connectDatabase'
import { Response } from 'express'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getProjectDetailsDTO } from '@dtos/projects/ProjectDetailsDto'
import { getAuthenticatedUserService } from '@services/user/auth/getAuthenticatedUserService'
import { getTeamForUserService } from '@services/user/getTeamForUserService'

/**
 * Récupère un projet et ses membres par key
 * @param req
 * @param res
 */
export const getProjectByKeyController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const key = req.params.key
        const user = await getAuthenticatedUserService(req)
        const team = await getTeamForUserService(user)

        const project = await AppDataSource.getRepository(Project).findOne({
            where: {
                key,
                team: { id: team.id }
            },
            relations: [
                'members',
                'members.user',
                'team',
                'columns',
                'tasks',
                'columns.tasks'
            ]
        })

        if (!project) {
            res.status(404).json({ message: ResponseMessages.projectNotFound })
            return
        }

        res.status(200).json({ project: getProjectDetailsDTO(project) })
    } catch (error) {
        console.error('Error fetching project by key:', error)
        res.status(400).json({ message: (error as Error).message || ResponseMessages.internalServerError })
    }
}
