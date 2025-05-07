import { User } from '../../entities/user/User'
import { MembershipDto } from '../team/MembershipDto'

export interface GetAuthenticatedUserDto {
    id: string
    email: string
    firstName?: string
    lastName?: string
    memberships?: MembershipDto[]
}

/**
 * Transforme un User en DTO pour la réponse front
 * @param user
 */
export const getAuthenticatedUserDTO = (
    user: User
): GetAuthenticatedUserDto => {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        memberships: user.memberships.map(m => {
            return {
                id: m.id,
                role: m.role,
                team: {
                    id: m.team.id,
                    name: m.team.name
                }
            }
        }) ?? []
    }
}
