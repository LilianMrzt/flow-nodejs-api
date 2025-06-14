import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'

/**
 * Récupère l'utilisateur authentifié
 * @param req
 */
export const getAuthenticatedUserService = async (
    req: AuthenticatedRequest
): Promise<User> => {
    const user = await AppDataSource.getRepository(User).findOne({
        where: { id: req.user?.userId },
        relations: ['memberships', 'memberships.team']
    })

    if (!user) {
        throw new Error('User not found.')
    }

    return user
}
