import { Request, Response } from 'express'
import { ResponseMessages } from '@constants/ResponseMessages'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { getAuthenticatedUserDTO } from '@dtos/user/AuthenticatedUserDto'
import { UserLoginDto } from '@dtos/user/UserLoginDto'
import { getAuthenticatedUserService, loginUserService, registerUserService } from '@services/user/userAuthService'
import { UserRegisterDto } from '@dtos/user/UserRegisterDto'

/**
 * Service pour créer un utilisateur
 * @param req
 * @param res
 */
export const createUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const body: UserRegisterDto = req.body

    try {
        const newUser = await registerUserService(body)

        res.status(201).json({
            message: ResponseMessages.userCreated,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                memberships: newUser.memberships,
                color: newUser.color
            }
        })
    } catch (error) {
        console.error('Error creating user:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Service pour gérer la connexion à l'app
 * @param req
 * @param res
 */
export const loginUser = async (
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

/**
 * Retourne les infos de l'utilisateur authentifié
 * @param req
 * @param res
 */
export const getAuthenticatedUser = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const user = await getAuthenticatedUserService(req)

        res.status(200).json(getAuthenticatedUserDTO(user))
    } catch (error) {
        console.error('Error fetching authenticated user:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
