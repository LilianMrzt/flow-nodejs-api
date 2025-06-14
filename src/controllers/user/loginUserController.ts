import { Request, Response } from 'express'
import { UserLoginDto } from '@dtos/user/UserLoginDto'
import { loginUserService } from '@services/user/auth/loginUserService'

/**
 * Service pour gérer la connexion à l'app
 * @param req
 * @param res
 */
export const loginUserController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const body: UserLoginDto = req.body

    try {
        const { token, user } = await loginUserService(body)
        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                memberships: user.memberships,
                color: user.color
            }
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unauthorized.'
        res.status(401).json({ message })
    }
}
