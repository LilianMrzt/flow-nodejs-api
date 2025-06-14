import { Request, Response } from 'express'
import { ResetPasswordDto } from '@dtos/password-reset-token/ResetPasswordDto'
import { resetPasswordService } from '@services/password-reset-token/passwordResetService'

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
