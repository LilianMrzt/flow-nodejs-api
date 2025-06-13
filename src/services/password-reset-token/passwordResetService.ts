import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import { ForgotPasswordDto } from '@dtos/password-reset-token/ForgotPasswordDto'
import { PasswordResetToken } from '@entities/password-reset-token/PasswordResetToken'
import { ResetPasswordDto } from '@dtos/password-reset-token/ResetPasswordDto'
import process from 'process'
import { sendResetPasswordEmail } from '@emails/templates/ResetPasswordEmailTemplate'

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

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRATION_MINUTES * 60000)

    const resetToken = tokenRepo.create({ user, token, expiresAt })
    await tokenRepo.save(resetToken)

    const resetUrl = `${process.env.REACT_APP_FRONT_BASE_URL}/auth/reset-password?token=${token}`

    await sendResetPasswordEmail(user.email, resetUrl)
}

/**
 * Service pour la réinitialisation du mot de passe
 * @param dto
 */
export const resetPasswordService = async (
    dto: ResetPasswordDto
): Promise<void> => {
    const { token, newPassword, confirmPassword } = dto

    if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match.')
    }

    const tokenRepo = AppDataSource.getRepository(PasswordResetToken)
    const userRepo = AppDataSource.getRepository(User)

    const tokenEntry = await tokenRepo.findOne({
        where: { token },
        relations: ['user']
    })

    if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
        throw new Error('Invalid or expired token.')
    }

    const isSameAsOld = await bcrypt.compare(newPassword, tokenEntry.user.password)
    if (isSameAsOld) {
        throw new Error('New password cannot be the same as old password.')
    }

    tokenEntry.user.password = await bcrypt.hash(newPassword, 10)
    await userRepo.save(tokenEntry.user)
    await tokenRepo.delete({ id: tokenEntry.id })
}
