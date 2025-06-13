import express from 'express'
import {
    createTask,
    deleteTask, getTaskByKey,
    getTasksByProjectKey,
    reorderBacklogTasks,
    reorderColumnTasks,
    updateTask
} from '@controllers/TaskController'
import { authenticateJWT } from '@middleware/authenticateJWT'

const router = express.Router()

router.post('/projects/:key/tasks', authenticateJWT, createTask)
router.delete('/projects/:key/tasks/:taskId', authenticateJWT, deleteTask)
router.get('/projects/:key/tasks', authenticateJWT, getTasksByProjectKey)
router.patch('/projects/:key/tasks/reorder-backlog', authenticateJWT, reorderBacklogTasks)
router.patch('/projects/:key/tasks/reorder-column', authenticateJWT, reorderColumnTasks)
router.patch('/projects/:key/tasks/:taskId', authenticateJWT, updateTask)
router.get('/projects/:key/tasks/:taskKey', authenticateJWT, getTaskByKey)

export default router
