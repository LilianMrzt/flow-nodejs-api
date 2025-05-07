import { User } from '../../entities/user/User'
import { AppDataSource } from '../../config/connectDatabase'
import { TeamMember } from '../../entities/team/TeamMember'
import { Team } from '../../entities/team/Team'

/**
 * Récupère un utilisateur par ID
 * @param userId
 */
export const findUserById = async (
    userId?: string
): Promise<User> => {
    if (!userId) {
        throw new Error('User ID is missing from token')
    }

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId })
    if (!user) {
        throw new Error('User not found')
    }

    return user
}

/**
 * Récupère la team associée à un utilisateur
 * @param user
 */
export const getTeamForUser = async (
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
