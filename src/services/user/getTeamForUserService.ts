import { User } from '@entities/user/User'
import { Team } from '@entities/team/Team'
import { AppDataSource } from '@config/connectDatabase'
import { TeamMember } from '@entities/team/TeamMember'

/**
 * Récupère la team associée à un utilisateur
 * @param user
 */
export const getTeamForUserService = async (
    user: User
): Promise<Team> => {
    const teamMember = await AppDataSource.getRepository(TeamMember).findOne({
        where: { user: { id: user.id } },
        relations: ['team']
    })

    if (!teamMember) {
        throw new Error('User has no team')
    }

    return teamMember.team
}
