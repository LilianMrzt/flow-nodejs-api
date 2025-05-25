import { Request, Response } from 'express'
import { AppDataSource } from '../config/connectDatabase'
import { User } from '../entities/user/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ResponseMessages } from '../constants/ResponseMessages'
import { Team } from '../entities/team/Team'
import { TeamMember } from '../entities/team/TeamMember'
import { AuthenticatedRequest } from '../middleware/authenticateJWT'
import { getAuthenticatedUserDTO } from '../dtos/user/AuthenticatedUserDto'
import { isValidEmail, isValidPassword } from '../services/user/UserService'

/**
 * Service pour créer un utilisateur
 * @param req
 * @param res
 */
export const createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password, firstName, lastName } = req.body

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: ResponseMessages.invalidEmail })
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: ResponseMessages.weakPassword })
        }

        const userRepository = AppDataSource.getRepository(User)
        const existingUser = await userRepository.findOne({ where: { email } })

        if (existingUser) {
            return res.status(400).json({ message: ResponseMessages.emailInUse })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        })

        await userRepository.save(newUser)

        const team = new Team()
        team.name = `${firstName || 'Default'}'s Team`

        const member = new TeamMember()
        member.user = newUser
        member.role = 'admin'
        member.team = team

        team.members = [member]

        await AppDataSource.getRepository(Team).save(team)

        return res.status(201).json({ message: ResponseMessages.userCreated, user: newUser })
    } catch (error) {
        console.error('Error creating user:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Service pour gérer la connexion à l'app
 * @param req
 * @param res
 */
export const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body

        const userRepository = AppDataSource.getRepository(User)
        const user = await userRepository.findOne({ where: { email } })

        if (!user) {
            return res.status(401).json({ message: ResponseMessages.invalidCredentials })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: ResponseMessages.invalidCredentials })
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string
        )

        return res.status(200).json({ message: ResponseMessages.loginSuccess, token })
    } catch (error) {
        console.error('Error logging in:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
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
): Promise<Response> => {
    try {
        const userId = req.user?.userId

        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: userId },
            relations: ['memberships', 'memberships.team']
        })

        if (!user) {
            return res.status(404).json({ message: ResponseMessages.userNotFound })
        }

        return res.status(200).json(getAuthenticatedUserDTO(user))
    } catch (error) {
        console.error('Error fetching authenticated user:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
