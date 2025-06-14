import { AppDataSource } from '@config/connectDatabase'
import { ResponseMessages } from '@constants/ResponseMessages'
import { Project } from '@entities/project/Project'

/**
 * Récupère un projet via sa key avec ses relations associées
 * @param key
 */
export const findProjectByKeyService = async (
    key: string
): Promise<Project> => {
    const project = await AppDataSource.getRepository(Project).findOne({
        where: { key },
        relations: ['team']
    })

    if (!project) throw new Error(ResponseMessages.projectNotFound)
    return project
}
