import express from 'express'
import {
    createTask,
    deleteTask, getTaskByKey,
    getTasksByProjectKey,
    reorderBacklogTasks,
    reorderColumnTasks,
    updateTask
} from '../controllers/TaskController'
import { authenticateJWT } from '../middleware/authenticateJWT'

const router = express.Router()

router.post('/projects/:key/tasks', authenticateJWT, createTask as never)
router.delete('/projects/:key/tasks/:taskId', authenticateJWT, deleteTask as never)
router.get('/projects/:key/tasks', authenticateJWT, getTasksByProjectKey as never)
router.patch('/projects/:key/tasks/reorder-backlog', authenticateJWT, reorderBacklogTasks as never)
router.patch('/projects/:key/tasks/reorder-column', authenticateJWT, reorderColumnTasks as never)
router.patch('/projects/:key/tasks/:taskId', authenticateJWT, updateTask as never)
router.get('/projects/:key/tasks/:taskKey', authenticateJWT, getTaskByKey as never)

export default router
