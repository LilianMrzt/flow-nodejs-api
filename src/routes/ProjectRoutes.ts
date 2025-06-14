import express from 'express'
import { updateProjectController } from '@controllers/project/updateProjectController'
import { authenticateJWT } from '@middleware/authenticateJWT'
import { createProjectController } from '@controllers/project/createProjectController'
import { getProjectsForUserController } from '@controllers/project/getProjectsForUserController'
import { getRecentProjectsForUserController } from '@controllers/project/getRecentProjectsForUserController'
import { getProjectByKeyController } from '@controllers/project/getProjectByKeyController'
import { deleteProjectController } from '@controllers/project/deleteProjectController'

const router = express.Router()

router.post('/projects', authenticateJWT, createProjectController)
router.get('/projects', authenticateJWT, getProjectsForUserController)
router.get('/projects/recent', authenticateJWT, getRecentProjectsForUserController)
router.get('/projects/:key', authenticateJWT, getProjectByKeyController)
router.delete('/projects/:id', authenticateJWT, deleteProjectController)
router.put('/projects/:id', authenticateJWT, updateProjectController)

export default router
