import express from 'express'
import { createUser, getAuthenticatedUser, loginUser } from '../controllers/UserController'
import { authenticateJWT } from '../middleware/authenticateJWT'

const router = express.Router()

router.post('/auth/users', createUser as never)
router.post('/auth/login', loginUser as never)
router.get('/auth/me', authenticateJWT, getAuthenticatedUser as never)

export default router
