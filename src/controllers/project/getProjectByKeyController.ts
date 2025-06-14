import { Project } from '@entities/project/Project'
import { AppDataSource } from '@config/connectDatabase'
import { Response } from 'express'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getTeamForUser } from '@services/user/UserService'
import { getProjectDetailsDTO } from '@dtos/projects/ProjectDetailsDto'
import { getAuthenticatedUserService } from '@services/user/userAuthService'

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
        const team = await getTeamForUser(user)

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
