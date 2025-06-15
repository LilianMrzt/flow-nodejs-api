import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'
import bcrypt from 'bcrypt'
import { isValidPasswordService } from '@services/user/isValidPasswordService'
import { ResponseMessages } from '@constants/ResponseMessages'
import { UserRegisterDto } from '@dtos/user/UserRegisterDto'
import { isValidEmailService } from '@services/user/isValidEmailService'

/**
 * Vérification des informations envoyées lors de la création d'un compte
 * @param dto
 */
export const registerUserService = async (
    dto: UserRegisterDto
): Promise<User> => {
    const { email, password, confirmPassword, firstName, lastName } = dto

    if (!isValidEmailService(email)) {
        throw new Error(ResponseMessages.invalidEmail)
    }

    if (!isValidPasswordService(password)) {
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
        lastName,
        authProvider: 'local'
    })

    await userRepository.save(newUser)

    return newUser
}
