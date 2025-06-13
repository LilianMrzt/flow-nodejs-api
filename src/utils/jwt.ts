import jwt from 'jsonwebtoken'
import process from 'process'

/**
 * Génère un token JWT pour un utilisateur à partir du payload fourni.
 * @param payload
 */
export const generateUserToken = (payload: object): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined.')
    }

    return jwt.sign(
        payload,
        process.env.JWT_SECRET
    )
}
