import { AuthenticatedUserDto } from '@dtos/user/AuthenticatedUserDto'

export interface LoginUserResult {
    token: string
    user: AuthenticatedUserDto
}
