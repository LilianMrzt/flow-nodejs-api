import { Request, Response } from 'express'
import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'

export const userVerificationController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
        res.status(400).json({ message: 'Invalid verification token.' })
        return
    }

    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { emailVerificationToken: token } })

    if (!user) {
        res.status(400).json({ message: 'Invalid or expired token.' })
        return
    }

    user.isEmailVerified = true
    user.emailVerificationToken = null
    await userRepository.save(user)

    res.json({ message: 'Email verified successfully.' })
}
