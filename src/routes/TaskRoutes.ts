import express from 'express'
import { createTask } from '../controllers/TaskController'
import { authenticateJWT } from '../middleware/authenticateJWT'

const router = express.Router()

router.post('/projects/:slug/tasks', authenticateJWT, createTask as never)

export default router
