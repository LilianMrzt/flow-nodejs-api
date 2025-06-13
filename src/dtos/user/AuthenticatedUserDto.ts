import { User } from '@entities/user/User'
import { getMembershipDto, MembershipDto } from '@dtos/team/MembershipDto'

export interface AuthenticatedUserDto {
    id: string
    email: string
    firstName?: string
    lastName?: string
    memberships?: MembershipDto[]
    color?: string
}

/**
 * Transforme un User en DTO pour la réponse front
 * @param user
 */
export const getAuthenticatedUserDTO = (
    user: User
): AuthenticatedUserDto => {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        memberships: user.memberships?.map(getMembershipDto) ?? [],
        color: user.color
    }
}
