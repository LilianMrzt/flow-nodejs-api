import express from 'express'
import { reorderColumnTasksController } from '@controllers/task/reorderColumnTasksController'
import { authenticateJWT } from '@middleware/authenticateJWT'
import { createTaskController } from '@controllers/task/createTaskController'
import { reorderBacklogTasksController } from '@controllers/task/reorderBacklogTasksController'
import { deleteTaskController } from '@controllers/task/deleteTaskController'
import { updateTaskController } from '@controllers/task/updateTaskController'
import { getTaskByKeyController } from '@controllers/task/getTaskByKeyController'
import { getTasksByProjectKeyController } from '@controllers/task/getTasksByProjectKey'

const router = express.Router()

router.post('/projects/:key/tasks', authenticateJWT, createTaskController)
router.delete('/projects/:key/tasks/:taskId', authenticateJWT, deleteTaskController)
router.get('/projects/:key/tasks', authenticateJWT, getTasksByProjectKeyController)
router.patch('/projects/:key/tasks/reorder-backlog', authenticateJWT, reorderBacklogTasksController)
router.patch('/projects/:key/tasks/reorder-column', authenticateJWT, reorderColumnTasksController)
router.patch('/projects/:key/tasks/:taskId', authenticateJWT, updateTaskController)
router.get('/projects/:key/tasks/:taskKey', authenticateJWT, getTaskByKeyController)

export default router
