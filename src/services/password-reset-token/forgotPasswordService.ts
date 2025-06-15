import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'
import { ForgotPasswordDto } from '@dtos/password-reset-token/ForgotPasswordDto'
import { PasswordResetToken } from '@entities/password-reset-token/PasswordResetToken'
import process from 'process'
import { sendResetPasswordEmail } from '@emails/templates/sendResetPasswordEmail'
import crypto from 'crypto'

const PASSWORD_RESET_EXPIRATION_MINUTES = 15

/**
 * Service pour la gestion de demande de réinitialisation du mot de passe
 * @param dto
 */
export const forgotPasswordService = async (
    dto: ForgotPasswordDto
): Promise<void> => {
    const userRepo = AppDataSource.getRepository(User)
    const tokenRepo = AppDataSource.getRepository(PasswordResetToken)

    const user = await userRepo.findOneBy({
        email: dto.email
    })
    if (!user) return

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRATION_MINUTES * 60000)

    const resetToken = tokenRepo.create({
        user,
        token,
        expiresAt
    })
    await tokenRepo.save(resetToken)

    const resetUrl = `${process.env.REACT_APP_FRONT_BASE_URL}/auth/reset-password?token=${token}`

    await sendResetPasswordEmail(user, resetUrl)
}
