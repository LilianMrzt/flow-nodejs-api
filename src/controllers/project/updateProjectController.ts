import { Project } from '@entities/project/Project'
import { AppDataSource } from '@config/connectDatabase'
import { Response } from 'express'
import { AuthenticatedRequest } from '@middleware/authenticateJWT'
import { ResponseMessages } from '@constants/ResponseMessages'
import { getTeamForUser } from '@services/user/UserService'
import { validateProjectKey } from '@services/project/ProjectService'
import { Task } from '@entities/task/Task'
import { getAuthenticatedUserService } from '@services/user/userAuthService'

/**
 * Met à jour les informations d'un projet
 * @param req
 * @param res
 */
export const updateProjectController = async (
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
