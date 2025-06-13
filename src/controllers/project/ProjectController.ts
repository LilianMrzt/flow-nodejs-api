import { ProjectMember } from '@entities/project/ProjectMember'
import { ProjectRole } from '@constants/ProjectRole'
import { Project } from '@entities/project/Project'
import { AppDataSource } from '@config/connectDatabase'
import { Response } from 'express'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getTeamForUser } from '@services/user/UserService'
import { BoardColumn } from '@entities/board-column/BoardColumn  '
import { validateProjectKey } from '@services/project/ProjectService'
import { Task } from '@entities/task/Task'
import { getProjectSummaryDTO } from '@dtos/projects/ProjectSummaryDto'
import { getProjectDetailsDTO } from '@dtos/projects/ProjectDetailsDto'
import { getAuthenticatedUserService } from '@services/user/userAuthService'

/**
 * Crée un nouveau projet et assigne l'utilisateur authentifié en tant qu'admin
 * @param req
 * @param res
 */
export const createProject = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, description, key } = req.body

        const user = await getAuthenticatedUserService(req)
        const team = await getTeamForUser(user)

        await validateProjectKey(key, team.id)

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

/**
 * Récupère un projet et ses membres par key
 * @param req
 * @param res
 */
export const getProjectByKey = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const key = req.params.key
        const user = await getAuthenticatedUserService(req)
        const team = await getTeamForUser(user)

        const project = await AppDataSource.getRepository(Project).findOne({
            where: {
                key,
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
            res.status(404).json({ message: ResponseMessages.projectNotFound })
            return
        }

        res.status(200).json({ project: getProjectDetailsDTO(project) })
    } catch (error) {
        console.error('Error fetching project by key:', error)
        res.status(400).json({ message: (error as Error).message || ResponseMessages.internalServerError })
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
): Promise<void> => {
    try {
        const user = await getAuthenticatedUserService(req)
        const limit = parseInt(req.query.limit as string) || 10
        const offset = parseInt(req.query.offset as string) || 0

        const memberRepository = AppDataSource.getRepository(ProjectMember)

        const memberships = await memberRepository.find({
            where: { user: { id: user.id } },
            relations: ['project'],
            skip: offset,
            take: limit
        })

        const projects = memberships.map(m => {
            return getProjectSummaryDTO(m.project)
        })

        res.status(200).json({ projects })
    } catch (error) {
        console.error('Error fetching user projects:', error)
        res.status(400).json({ message: (error as Error).message || ResponseMessages.internalServerError })
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
): Promise<void> => {
    try {
        const user = await getAuthenticatedUserService(req)

        const memberRepository = AppDataSource.getRepository(ProjectMember)

        const memberships = await memberRepository.find({
            where: { user: { id:  user.id } },
            relations: ['project'],
            order: {
                project: {
                    updatedAt: 'DESC'
                }
            },
            take: 4
        })

        const projects = memberships.map(m => {
            return getProjectSummaryDTO(m.project)
        })

        res.status(200).json({ projects })
    } catch (error) {
        console.error('Error fetching recent projects:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Supprime un projet par son ID (si l'utilisateur appartient à l'équipe)
 * @param req
 * @param res
 */
export const deleteProject = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params

        const user = await getAuthenticatedUserService(req)
        const team = await getTeamForUser(user)

        const projectRepo = AppDataSource.getRepository(Project)

        const project = await projectRepo.findOne({
            where: {
                id,
                team: { id: team.id }
            }
        })

        if (!project) {
            res.status(404).json({ message: ResponseMessages.projectNotFound })
            return
        }

        await projectRepo.remove(project)

        res.status(200).json({ message: 'Project successfully deleted.' })
    } catch (error) {
        console.error('Error deleting project by ID:', error)
        res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}

/**
 * Met à jour les informations d'un projet
 * @param req
 * @param res
 */
export const updateProject = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params
        const { name, description, key } = req.body

        const user = await getAuthenticatedUserService(req)
        const team = await getTeamForUser(user)

        const projectRepo = AppDataSource.getRepository(Project)

        const project = await projectRepo.findOne({
            where: { id, team: { id: team.id } },
            relations: ['team']
        })

        if (!project) {
            res.status(404).json({ message: ResponseMessages.projectNotFound })
            return
        }

        if (key && key !== project.key) {
            await validateProjectKey(key, team.id)
            project.key = key.toUpperCase()

            const taskRepo = AppDataSource.getRepository(Task)
            const tasks = await taskRepo.find({
                where: { project: { id: project.id } }
            })

            for (const task of tasks) {
                const oldKeyNumber = task.key.split('-')[1]
                task.key = `${project.key}-${oldKeyNumber}`
            }

            await taskRepo.save(tasks)
        }

        if (name !== undefined) project.name = name
        if (description !== undefined) project.description = description

        project.updatedAt = new Date()

        await projectRepo.save(project)

        res.status(200).json({
            message: 'Project successfully updated.',
            project
        })
    } catch (error) {
        console.error('Error updating project:', error)
        res.status(400).json({ message: (error as Error).message || ResponseMessages.internalServerError })
    }
}
