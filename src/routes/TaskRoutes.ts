import express from 'express'
import {
    createTask,
    deleteTask, getTaskByKey,
    getTasksByProjectSlug,
    reorderBacklogTasks,
    reorderColumnTasks,
    updateTask
} from '../controllers/TaskController'
import { authenticateJWT } from '../middleware/authenticateJWT'

const router = express.Router()

router.post('/projects/:slug/tasks', authenticateJWT, createTask as never)
router.delete('/projects/:slug/tasks/:taskId', authenticateJWT, deleteTask as never)
router.get('/projects/:slug/tasks', authenticateJWT, getTasksByProjectSlug as never)
router.patch('/projects/:slug/tasks/reorder-backlog', authenticateJWT, reorderBacklogTasks as never)
router.patch('/projects/:slug/tasks/reorder-column', authenticateJWT, reorderColumnTasks as never)
router.patch('/projects/:slug/tasks/:taskId', authenticateJWT, updateTask as never)
router.get('/projects/:slug/tasks/:taskKey', authenticateJWT, getTaskByKey as never)

export default router
