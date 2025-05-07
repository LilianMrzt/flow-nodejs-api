import express from 'express'
import { createUser, loginUser } from '../controllers/userController'

const router = express.Router()

router.post('/users', createUser as never)
router.post('/login', loginUser as never)

export default router
