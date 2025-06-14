import { Request, Response } from 'express'
import { ForgotPasswordDto } from '@dtos/password-reset-token/ForgotPasswordDto'
import { forgotPasswordService } from '@services/password-reset-token/forgotPasswordService'

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
