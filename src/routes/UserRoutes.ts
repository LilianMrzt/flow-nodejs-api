import express from 'express'
import { createUser, getAuthenticatedUser, loginUser } from '@controllers/UserController'
import { authenticateJWT } from '@middleware/authenticateJWT'

const router = express.Router()

router.post('/auth/users', createUser)
router.post('/auth/login', loginUser)
router.get('/auth/me', authenticateJWT, getAuthenticatedUser)

export default router
