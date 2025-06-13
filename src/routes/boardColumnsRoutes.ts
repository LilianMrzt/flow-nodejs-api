import { Router } from 'express'
import { getColumnsByProjectKey } from '@controllers/BoardColumnController'
import { authenticateJWT } from '@middleware/authenticateJWT'

const router = Router()

router.get('/projects/:key/columns', authenticateJWT, getColumnsByProjectKey)

export default router
