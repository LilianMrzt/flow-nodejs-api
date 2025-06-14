import { User } from '@entities/user/User'
import { AppDataSource } from '@config/connectDatabase'

/**
 * Récupère un utilisateur par ID
 * @param userId
 */
export const findUserByIdService = async (
    userId?: string
): Promise<User> => {
    if (!userId) {
        throw new Error('User ID is missing from token')
    }

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId })
    if (!user) {
        throw new Error('User not found')
    }

    return user
}
