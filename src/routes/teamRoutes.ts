import { Router } from 'express'
import { authenticateJWT } from '@middleware/authenticateJWT'
import { createTeamController, joinTeamController } from '@controllers/team/teamController'

const router = Router()

router.post('/teams', authenticateJWT, createTeamController)
router.post('/teams/join', authenticateJWT, joinTeamController)

export default router
