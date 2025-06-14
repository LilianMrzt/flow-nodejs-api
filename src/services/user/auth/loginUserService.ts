import { UserLoginDto } from '@dtos/user/UserLoginDto'
import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'
import bcrypt from 'bcrypt'
import { generateUserToken } from '@utils/jwt'
import { getAuthenticatedUserDTO } from '@dtos/user/AuthenticatedUserDto'
import { LoginUserResult } from '@dtos/user/loginUserResult'

/**
 * Vérifie les identifiants d’un administrateur et retourne un token JWT s’ils sont valides.
 * @param dto
 */
export const loginUserService = async (
    dto: UserLoginDto
): Promise<LoginUserResult> => {
    const { email, password } = dto
    const repo = AppDataSource.getRepository(User)

    const user = await repo.findOne({
        where: { email },
        relations: ['memberships', 'memberships.team']
    })

    if (!user) {
        throw new Error('Invalid credentials.')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
        throw new Error('Invalid credentials.')
    }

    const token = generateUserToken({
        userId: user.id,
        email: user.email
    })

    return {
        token,
        user: getAuthenticatedUserDTO(user)
    }
}
