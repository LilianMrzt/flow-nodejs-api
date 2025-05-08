import { ProjectMember } from '../entities/project/ProjectMember'
import { ProjectRole } from '../constants/ProjectRole'
import { Project } from '../entities/project/Project'
import { AppDataSource } from '../config/connectDatabase'
import { Response } from 'express'
import { AuthenticatedRequest } from '../middleware/authenticateJWT'
import { ResponseMessages } from '../constants/ResponseMessages'
import { getCreateProjectDTO } from '../dtos/projects/CreateProjectDto'
import { findUserById, getTeamForUser } from '../services/user/UserService'
import { BoardColumn } from '../entities/board-column/BoardColumn '

/**
 * Crée un nouveau projet et assigne l'utilisateur authentifié en tant qu'admin
 * @param req
 * @param res
 */
export const createProject = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { name, description } = req.body

        const user = await findUserById(req.user?.userId)
        const team = await getTeamForUser(user)

        const project = new Project()
        project.name = name
        project.description = description
        project.team = team

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

        return res.status(201).json({
            message: ResponseMessages.projectCreated,
            project: getCreateProjectDTO(project)
        })
    } catch (error) {
        console.error('Error creating project:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Récupère un projet et ses membres par slug
 * @param req
 * @param res
 */
export const getProjectBySlug = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const slug = req.params.slug
        const user = await findUserById(req.user?.userId)
        const team = await getTeamForUser(user)

        const project = await AppDataSource.getRepository(Project).findOne({
            where: {
                slug,
                team: { id: team.id }
            },
            relations: [
                'members',
                'members.user',
                'team',
                'columns',
                'tasks',
                'columns.tasks'
            ]
        })

        if (!project) {
            return res.status(404).json({ message: ResponseMessages.projectNotFound })
        }

        return res.status(200).json({ project })
    } catch (error) {
        console.error('Error fetching project by slug:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Récupère tous les projets dans lesquels l'utilisateur authentifié est membre
 * @param req
 * @param res
 */
export const getProjectsForUser = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const userId = req.user?.userId
        const limit = parseInt(req.query.limit as string) || 10
        const offset = parseInt(req.query.offset as string) || 0

        const memberRepository = AppDataSource.getRepository(ProjectMember)

        const memberships = await memberRepository.find({
            where: { user: { id: userId } },
            relations: ['project'],
            skip: offset,
            take: limit
        })

        const projects = memberships.map(m => {
            return m.project
        })

        return res.status(200).json({ projects })
    } catch (error) {
        console.error('Error fetching user projects:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Récupération des 4 projets les plus recemment modifiés
 * @param req
 * @param res
 */
export const getRecentProjectsForUser = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const userId = req.user?.userId

        const memberRepository = AppDataSource.getRepository(ProjectMember)

        const memberships = await memberRepository.find({
            where: { user: { id: userId } },
            relations: ['project'],
            order: {
                project: {
                    updatedAt: 'DESC'
                }
            },
            take: 4
        })

        const projects = memberships.map(m => {
            return m.project
        })

        return res.status(200).json({ projects })
    } catch (error) {
        console.error('Error fetching recent projects:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
