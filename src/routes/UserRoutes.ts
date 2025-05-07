import express from 'express'
import { createUser, loginUser } from '../controllers/UserController'

const router = express.Router()

router.post('/auth/users', createUser as never)
router.post('/auth/login', loginUser as never)

export default router
