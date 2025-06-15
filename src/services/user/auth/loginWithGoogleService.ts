import { OAuth2Client } from 'google-auth-library'
import { LoginUserResult } from '@dtos/user/loginUserResult'
import { AppDataSource } from '@config/connectDatabase'
import { User } from '@entities/user/User'
import { generateUserToken } from '@utils/jwt'
import { getAuthenticatedUserDTO } from '@dtos/user/AuthenticatedUserDto'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const loginWithGoogleService = async (
    idToken: string
): Promise<LoginUserResult> => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    if (!payload?.email) {
        throw new Error('Invalid Google token')
    }

    const repo = AppDataSource.getRepository(User)

    let user = await repo.findOne({
        where: { email: payload.email },
        relations: ['memberships', 'memberships.team']
    })

    if (user) {
        if (user.authProvider === 'local') {
            throw new Error('This account was created with email & password. Please login manually.')
        }
    } else {
        user = repo.create({
            email: payload.email,
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            password: '',
            authProvider: 'google'
        })
        await repo.save(user)
    }

    const token = generateUserToken({
        userId: user.id,
        email: user.email
    })

    return {
        token,
        user: getAuthenticatedUserDTO(user)
    }
}
