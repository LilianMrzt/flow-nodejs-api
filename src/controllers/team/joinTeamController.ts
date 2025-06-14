import { Response } from 'express'
import { Team } from '@entities/team/Team'
import { TeamMember } from '@entities/team/TeamMember'
import { ResponseMessages } from '@constants/ResponseMessages'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { AppDataSource } from '@config/connectDatabase'
import { getAuthenticatedUserService } from '@services/user/auth/getAuthenticatedUserService'

/**
 * Permet de rejoindre une team existante
 * @param req
 * @param res
 */
export const joinTeamController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { joinCode } = req.body

    try {
        const user = await getAuthenticatedUserService(req)
        const team = await AppDataSource.getRepository(Team).findOneByOrFail({ joinCode })

        const existingMembership = await AppDataSource.getRepository(TeamMember).findOne({
            where: { team: { id: team.id }, user: { id: user.id } }
        })

        if (existingMembership) {
            res.status(400).json({ message: 'User is already a member of this team.' })
            return
        }

        const member = AppDataSource.getRepository(TeamMember).create({ user, team, role: 'member' })
        await AppDataSource.getRepository(TeamMember).save(member)

        res.status(200).json({ message: 'Joined team successfully.', team })
    } catch (error) {
        console.error('Error joining team:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
