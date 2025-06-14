import { Request, Response } from 'express'
import { ResponseMessages } from '@constants/ResponseMessages'
import { registerUserService } from '@services/user/auth/registerUserService'
import { UserRegisterDto } from '@dtos/user/UserRegisterDto'

/**
 * Service pour créer un utilisateur
 * @param req
 * @param res
 */
export const createUserController = async (
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
