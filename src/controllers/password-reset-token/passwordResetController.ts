import { Request, Response } from 'express'
import { ForgotPasswordDto } from '@dtos/password-reset-token/ForgotPasswordDto'
import { forgotPasswordService, resetPasswordService } from '@services/password-reset-token/passwordResetService'
import { ResetPasswordDto } from '@dtos/password-reset-token/ResetPasswordDto'
import { PasswordResetToken } from '@entities/password-reset-token/PasswordResetToken'
import { AppDataSource } from '@config/connectDatabase'

/**
 * Gère la demande de réinitialisation du mot de passe
 * @param req
 * @param res
 */
export const forgotPasswordController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const dto: ForgotPasswordDto = req.body
    try {
        await forgotPasswordService(dto)
        res.status(200).json({ message: 'If an account exists for this email, a reset link has been sent.' })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process password reset request.'
        res.status(400).json({ message })
    }
}

/**
 * Gère la réinitialisation du mot de passe
 * @param req
 * @param res
 */
export const resetPasswordController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const dto: ResetPasswordDto = req.body
    try {
        await resetPasswordService(dto)
        res.status(200).json({ message: 'Password has been reset successfully.' })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Reset failed.'
        res.status(400).json({ message })
    }
}

/**
 * Vérifie la validité du token de réinitialisation
 * @param req
 * @param res
 */
export const verifyResetTokenController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const token = req.query.token as string

    if (!token) {
        res.status(400).json({ valid: false })
        return
    }

    const tokenRepo = AppDataSource.getRepository(PasswordResetToken)
    const found = await tokenRepo.findOneBy({ token })

    if (!found || found.expiresAt < new Date()) {
        res.status(400).json({ valid: false })
        return
    }

    res.status(200).json({ valid: true })
}
