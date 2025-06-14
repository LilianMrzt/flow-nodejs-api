import { Router } from 'express'
import { authenticateJWT } from '@middleware/authenticateJWT'
import { joinTeamController } from '@controllers/team/joinTeamController'
import { createTeamController } from '@controllers/team/createTeamController'

const router = Router()

router.post('/teams', authenticateJWT, createTeamController)
router.post('/teams/join', authenticateJWT, joinTeamController)

export default router
