import express from 'express'
import { getAuthenticatedUserController } from '@controllers/user/getAuthenticatedUserController'
import { authenticateJWT } from '@middleware/authenticateJWT'
import { verifyResetTokenController } from '@controllers/password-reset-token/verifyResetTokenController'
import { forgotPasswordController } from '@controllers/password-reset-token/forgotPasswordController'
import { resetPasswordController } from '@controllers/password-reset-token/resetPasswordController'
import { createUserController } from '@controllers/user/createUserController'
import { loginUserController } from '@controllers/user/loginUserController'
import { googleLoginController } from '@controllers/user/googleLoginController'

const router = express.Router()

router.post('/auth/users', createUserController)
router.post('/auth/login', loginUserController)
router.post('/auth/google', googleLoginController)
router.get('/auth/me', authenticateJWT, getAuthenticatedUserController)
router.post('/auth/forgot-password', forgotPasswordController)
router.post('/auth/reset-password', resetPasswordController)
router.get('/auth/verify-reset-token', verifyResetTokenController)

export default router
