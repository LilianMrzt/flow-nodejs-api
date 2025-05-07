import { ProjectMember } from '../entities/project/ProjectMember'
import { ProjectRole } from '../constants/ProjectRole'
import { Project } from '../entities/project/Project'
import { AppDataSource } from '../config/connectDatabase'
import { User } from '../entities/user/User'
import { Response } from 'express'
import { AuthenticatedRequest } from '../middleware/authenticateJWT'
import { ResponseMessages } from '../constants/ResponseMessages'
import { getCreateProjectDTO } from '../dtos/CreateProjectDto'

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
        const userId = req.user?.userId

        const userRepository = AppDataSource.getRepository(User)
        const projectRepository = AppDataSource.getRepository(Project)

        const user = await userRepository.findOneBy({ id: userId })
        if (!user) {
            return res.status(404).json({ message: ResponseMessages.userNotFound })
        }

        const project = new Project()
        project.name = name
        project.description = description

        const member = new ProjectMember()
        member.user = user
        member.role = ProjectRole.ADMIN
        member.project = project

        project.members = [member]

        await projectRepository.save(project)

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

        const projectRepository = AppDataSource.getRepository(Project)

        const project = await projectRepository.findOne({
            where: { slug },
            relations: ['members', 'members.user']
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

        const memberRepository = AppDataSource.getRepository(ProjectMember)

        const memberships = await memberRepository.find({
            where: { user: { id: userId } },
            relations: ['project']
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
