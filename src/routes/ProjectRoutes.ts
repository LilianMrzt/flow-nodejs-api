import express from 'express'
import {
    createProject,
    deleteProject,
    getProjectByKey,
    getProjectsForUser,
    getRecentProjectsForUser, updateProject
} from '../controllers/ProjectController'
import { authenticateJWT } from '../middleware/authenticateJWT'

const router = express.Router()

router.post('/projects', authenticateJWT, createProject as never)
router.get('/projects', authenticateJWT, getProjectsForUser as never)
router.get('/projects/recent', authenticateJWT, getRecentProjectsForUser as never)
router.get('/projects/:key', authenticateJWT, getProjectByKey as never)
router.delete('/projects/:id', authenticateJWT, deleteProject as never)
router.put('/projects/:id', authenticateJWT, updateProject as never)

export default router
