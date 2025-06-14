import { Project } from '@entities/project/Project'
import { AppDataSource } from '@config/connectDatabase'
import { Response } from 'express'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getAuthenticatedUserService } from '@services/user/auth/getAuthenticatedUserService'
import { getTeamForUserService } from '@services/user/getTeamForUserService'

/**
 * Supprime un projet par son ID (si l'utilisateur appartient à l'équipe)
 * @param req
 * @param res
 */
export const deleteProjectController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params

        const user = await getAuthenticatedUserService(req)
        const team = await getTeamForUserService(user)

        const projectRepo = AppDataSource.getRepository(Project)

        const project = await projectRepo.findOne({
            where: {
                id,
                team: { id: team.id }
            }
        })

        if (!project) {
            res.status(404).json({ message: ResponseMessages.projectNotFound })
            return
        }

        await projectRepo.remove(project)

        res.status(200).json({ message: 'Project successfully deleted.' })
    } catch (error) {
        console.error('Error deleting project by ID:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
