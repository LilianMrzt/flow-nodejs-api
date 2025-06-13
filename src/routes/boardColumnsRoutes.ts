import { Router } from 'express'
import { getColumnsByProjectKey } from '@controllers/board-column/BoardColumnController'
import { authenticateJWT } from '@middleware/authenticateJWT'

const router = Router()

router.get('/projects/:key/columns', authenticateJWT, getColumnsByProjectKey)

export default router
