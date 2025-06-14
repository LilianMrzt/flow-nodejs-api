import { Response } from 'express'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getProjectSummaryDTO } from '@dtos/projects/ProjectSummaryDto'
import { getAuthenticatedUserService } from '@services/user/userAuthService'
import { getProjectsForUserTeams } from '@services/project/projectAccessService'

/**
 * Récupère tous les projets dans lesquels l'utilisateur authentifié est membre
 * @param req
 * @param res
 */
export const getProjectsForUserController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const user = await getAuthenticatedUserService(req)
        const limit = parseInt(req.query.limit as string) || 10
        const offset = parseInt(req.query.offset as string) || 0

        const projects = await getProjectsForUserTeams(user.id, { limit, offset })

        res.status(200).json({ projects: projects.map(getProjectSummaryDTO) })
    } catch (error) {
        console.error('Error fetching user projects:', error)
        res.status(400).json({ message: (error as Error).message || ResponseMessages.internalServerError })
    }
}
