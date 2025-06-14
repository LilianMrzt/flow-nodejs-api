import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { ProjectMember } from '@entities/project/ProjectMember'
import { ProjectRole } from '@constants/ProjectRole'
import { Response } from 'express'
import { BoardColumn } from '@entities/board-column/BoardColumn'
import { validateProjectKeyService } from '@services/project/validateProjectKeyService'
import { AppDataSource } from '@config/connectDatabase'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getProjectSummaryDTO } from '@dtos/projects/ProjectSummaryDto'
import { Project } from '@entities/project/Project'
import { getAuthenticatedUserService } from '@services/user/auth/getAuthenticatedUserService'
import { getTeamForUserService } from '@services/user/getTeamForUserService'

/**
 * Crée un nouveau projet et assigne l'utilisateur authentifié en tant qu'admin
 * @param req
 * @param res
 */
export const createProjectController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, description, key } = req.body

        const user = await getAuthenticatedUserService(req)
        const team = await getTeamForUserService(user)

        await validateProjectKeyService(key, team.id)

        const project = new Project()
        project.name = name
        project.description = description
        project.team = team
        project.key = key.toUpperCase()

        const member = new ProjectMember()
        member.user = user
        member.role = ProjectRole.ADMIN
        member.project = project

        project.members = [member]

        const defaultColumns = [
            { name: 'To do', color: '#FF5733' },
            { name: 'In progress', color: '#FFC300' },
            { name: 'Done', color: '#28B463' }
        ]

        project.columns = defaultColumns.map((col, index) => {
            const column = new BoardColumn()
            column.name = col.name
            column.color = col.color
            column.order = index
            column.project = project
            return column
        })

        await AppDataSource.getRepository(Project).save(project)

        res.status(201).json({
            message: ResponseMessages.projectCreated,
            project: getProjectSummaryDTO(project)
        })
    } catch (error) {
        console.error('Error creating project:', error)
        res.status(400).json({ message: (error as Error).message || ResponseMessages.internalServerError })
    }
}
