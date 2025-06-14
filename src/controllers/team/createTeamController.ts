import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { Response } from 'express'
import { AppDataSource } from '@config/connectDatabase'
import { Team } from '@entities/team/Team'
import { TeamMember } from '@entities/team/TeamMember'
import { v4 as uuidv4 } from 'uuid'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getAuthenticatedUserService } from '@services/user/auth/getAuthenticatedUserService'

/**
 * Crée une team pour l'utilisateur
 * @param req
 * @param res
 */
export const createTeamController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { name } = req.body

    try {
        const user = await getAuthenticatedUserService(req)

        const teamRepo = AppDataSource.getRepository(Team)
        const memberRepo = AppDataSource.getRepository(TeamMember)

        const team = teamRepo.create({
            name,
            joinCode: uuidv4().replace(/-/g, '')
        })

        await teamRepo.save(team)

        const member = memberRepo.create({ user, team, role: 'admin' })
        await memberRepo.save(member)

        res.status(201).json({ team })
    } catch (error) {
        console.error('Error creating team:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
