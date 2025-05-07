import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ResponseMessages } from '../constants/ResponseMessages'

/**
 * Interface représentant le contenu attendu dans le token JWT
 */
interface JwtPayload {
    userId: string
    email: string
}

/**
 * Interface étendue pour inclure les infos utilisateur dans req.user
 */
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload
}

/**
 * Middleware d'authentification JWT
 * - Vérifie la présence d'un token dans l'en-tête Authorization
 * - Décode et vérifie la validité du token
 * - Ajoute les infos utilisateur dans req.user
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: ResponseMessages.missingOrInvalidToken })
        return
    }

    const token = authHeader.split(' ')[1]

    try {
        (req as AuthenticatedRequest).user = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
        next()
    } catch (error) {
        res.status(403).json({ message: ResponseMessages.invalidOrExpiredToken, error })
    }
}
