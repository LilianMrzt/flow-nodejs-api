import { Request, Response } from 'express'
import { PasswordResetToken } from '@entities/password-reset-token/PasswordResetToken'
import { AppDataSource } from '@config/connectDatabase'

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
