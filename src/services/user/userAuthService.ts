import { UserLoginDto } from '@dtos/user/UserLoginDto'
import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'
import bcrypt from 'bcrypt'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { generateUserToken } from '@utils/jwt'
import { getAuthenticatedUserDTO } from '@dtos/user/AuthenticatedUserDto'
import { LoginUserResult } from '@dtos/user/loginUserResult'
import { isValidEmail, isValidPassword } from '@services/user/UserService'
import { ResponseMessages } from '@constants/ResponseMessages'
import { UserRegisterDto } from '@dtos/user/UserRegisterDto'
import { Team } from '@entities/team/Team'
import { TeamMember } from '@entities/team/TeamMember'

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
        where: { email }
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

/**
 * Récupère l'utilisateur authentifié
 * @param req
 */
export const getAuthenticatedUserService = async (
    req: AuthenticatedRequest
): Promise<User> => {
    const user = await AppDataSource.getRepository(User).findOne({
        where: { id: req.user?.userId },
        relations: ['memberships', 'memberships.team']
    })

    if (!user) {
        throw new Error('User not found.')
    }

    return user
}

/**
 * Vérification des informations envoyées lors de la création d'un compte
 * @param dto
 */
export const registerUserService = async (dto: UserRegisterDto): Promise<User> => {
    const { email, password, confirmPassword, firstName, lastName } = dto

    if (!isValidEmail(email)) {
        throw new Error(ResponseMessages.invalidEmail)
    }

    if (!isValidPassword(password)) {
        throw new Error(ResponseMessages.weakPassword)
    }

    if (password !== confirmPassword) {
        throw new Error(ResponseMessages.passwordsDoNotMatch)
    }

    const userRepository = AppDataSource.getRepository(User)
    const existingUser = await userRepository.findOne({ where: { email } })

    if (existingUser) {
        throw new Error(ResponseMessages.emailInUse)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName
    })

    await userRepository.save(newUser)

    const team = new Team()
    team.name = `${firstName || 'Default'}'s Team`

    const member = new TeamMember()
    member.user = newUser
    member.role = 'admin'
    member.team = team

    team.members = [member]

    await AppDataSource.getRepository(Team).save(team)

    return newUser
}
