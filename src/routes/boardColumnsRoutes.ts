import { Router } from 'express'
import { getColumnsByProjectKeyController } from '@controllers/board-column/getColumnsByProjectKeyController'
import { authenticateJWT } from '@middleware/authenticateJWT'

const router = Router()

router.get('/projects/:key/columns', authenticateJWT, getColumnsByProjectKeyController)

export default router
