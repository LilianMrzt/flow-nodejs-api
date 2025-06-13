import express from 'express'
import {
    createProject,
    deleteProject,
    getProjectByKey,
    getProjectsForUser,
    getRecentProjectsForUser, updateProject
} from '@controllers/ProjectController'
import { authenticateJWT } from '@middleware/authenticateJWT'

const router = express.Router()

router.post('/projects', authenticateJWT, createProject)
router.get('/projects', authenticateJWT, getProjectsForUser)
router.get('/projects/recent', authenticateJWT, getRecentProjectsForUser)
router.get('/projects/:key', authenticateJWT, getProjectByKey)
router.delete('/projects/:id', authenticateJWT, deleteProject)
router.put('/projects/:id', authenticateJWT, updateProject)

export default router
