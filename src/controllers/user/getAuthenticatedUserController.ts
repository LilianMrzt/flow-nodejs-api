import { Response } from 'express'
import { ResponseMessages } from '@constants/ResponseMessages'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { getAuthenticatedUserDTO } from '@dtos/user/AuthenticatedUserDto'
import { getAuthenticatedUserService } from '@services/user/auth/getAuthenticatedUserService'

/**
 * Retourne les infos de l'utilisateur authentifié
 * @param req
 * @param res
 */
export const getAuthenticatedUserController = async (
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
