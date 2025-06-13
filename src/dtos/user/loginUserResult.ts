import { AuthenticatedUserDto } from './AuthenticatedUserDto'

export interface LoginUserResult {
    token: string
    user: AuthenticatedUserDto
}
