import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'
import bcrypt from 'bcrypt'
import { PasswordResetToken } from '@entities/password-reset-token/PasswordResetToken'
import { ResetPasswordDto } from '@dtos/password-reset-token/ResetPasswordDto'

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
