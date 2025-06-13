import { Response } from 'express'
import { Team } from '@entities/team/Team'
import { TeamMember } from '@entities/team/TeamMember'
import { ResponseMessages } from '@constants/ResponseMessages'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { AppDataSource } from '@config/connectDatabase'
import { getAuthenticatedUserService } from '@services/user/userAuthService'
import { v4 as uuidv4 } from 'uuid'

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
