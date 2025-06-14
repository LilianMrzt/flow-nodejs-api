import { Response } from 'express'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getProjectSummaryDTO } from '@dtos/projects/ProjectSummaryDto'
import { getAuthenticatedUserService } from '@services/user/userAuthService'
import { getProjectsForUserTeams } from '@services/project/projectAccessService'

/**
 * Récupération des 4 projets les plus recemment modifiés
 * @param req
 * @param res
 */
export const getRecentProjectsForUserController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const user = await getAuthenticatedUserService(req)

        const projects = await getProjectsForUserTeams(user.id, {
            limit: 4,
            orderByUpdatedAtDesc: true
        })

        res.status(200).json({ projects: projects.map(getProjectSummaryDTO) })
    } catch (error) {
        console.error('Error fetching recent projects:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
