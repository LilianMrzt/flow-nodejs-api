import { TeamMember } from '@entities/team/TeamMember'
import { Project } from '@entities/project/Project'
import { In } from 'typeorm'
import { AppDataSource } from '@config/connectDatabase'

/**
 * Retourne tous les projets des équipes dont fait partie un utilisateur
 * @param userId
 * @param options
 */
export const getProjectsForUserTeams = async (
    userId: string,
    options?: {
        limit?: number
        offset?: number
        orderByUpdatedAtDesc?: boolean
    }
): Promise<Project[]> => {
    const teamMemberships = await AppDataSource.getRepository(TeamMember).find({
        where: { user: { id: userId } },
        relations: ['team']
    })

    const teamIds = teamMemberships.map(m => {
        return m.team.id
    })

    if (teamIds.length === 0) return []

    return AppDataSource.getRepository(Project).find({
        where: { team: { id: In(teamIds) } },
        order: options?.orderByUpdatedAtDesc ? { updatedAt: 'DESC' } : undefined,
        take: options?.limit,
        skip: options?.offset
    })
}
