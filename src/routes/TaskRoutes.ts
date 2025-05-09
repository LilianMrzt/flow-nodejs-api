import express from 'express'
import { createTask, deleteTask, getTasksByProjectSlug } from '../controllers/TaskController'
import { authenticateJWT } from '../middleware/authenticateJWT'

const router = express.Router()

router.post('/projects/:slug/tasks', authenticateJWT, createTask as never)
router.delete('/projects/:slug/tasks/:taskId', authenticateJWT, deleteTask as never)
router.get('/projects/:slug/tasks', authenticateJWT, getTasksByProjectSlug as never)

export default router
