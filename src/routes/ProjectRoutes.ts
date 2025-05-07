import express from 'express'
import { createProject, getProjectBySlug, getProjectsForUser } from '../controllers/ProjectController'
import { authenticateJWT } from '../middleware/authenticateJWT'

const router = express.Router()

router.post('/projects', authenticateJWT, createProject as never)
router.get('/projects/:slug', authenticateJWT, getProjectBySlug as never)
router.get('/projects', authenticateJWT, getProjectsForUser as never)

export default router
