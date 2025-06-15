import { Request, Response } from 'express'
import { loginWithGoogleService } from '@services/user/auth/loginWithGoogleService'

export const googleLoginController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { idToken } = req.body

    try {
        const { token, user } = await loginWithGoogleService(idToken)

        res.status(200).json({
            message: 'Login with Google successful.',
            token,
            user
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid Google login.'
        res.status(401).json({ message })
    }
}
