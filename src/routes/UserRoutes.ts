import express from 'express'
import { createUser, getAuthenticatedUser, loginUser } from '@controllers/user/UserController'
import { authenticateJWT } from '@middleware/authenticateJWT'
import {
    forgotPasswordController,
    resetPasswordController, verifyResetTokenController
} from '@controllers/password-reset-token/passwordResetController'

const router = express.Router()

router.post('/auth/users', createUser)
router.post('/auth/login', loginUser)
router.get('/auth/me', authenticateJWT, getAuthenticatedUser)
router.post('/auth/forgot-password', forgotPasswordController)
router.post('/auth/reset-password', resetPasswordController)
router.get('/auth/verify-reset-token', verifyResetTokenController)

export default router
