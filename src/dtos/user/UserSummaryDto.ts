import { User } from '../../entities/user/User'

export interface UserSummaryDto {
    id: string
    email: string
    firstName?: string
    lastName?: string
    color?: string
}

export const getUserSummaryDto = (user: User): UserSummaryDto => {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        color: user.color
    }
}
