import { AppDataSource } from '@config/connectDatabase'
import { Project } from '@entities/project/Project'

/**
 * Vérifie que la clé est valide et unique pour l'équipe donnée
 * @param key
 * @param teamId
 */
export const validateProjectKey = async (key: string, teamId: string): Promise<void> => {
    if (!key || key.trim() === '') {
        throw new Error('Project key is required.')
    }

    const normalizedKey = key.toUpperCase()

    const projectRepo = AppDataSource.getRepository(Project)

    const existing = await projectRepo.findOne({
        where: {
            key: normalizedKey,
            team: { id: teamId }
        },
        relations: ['team']
    })

    if (existing) {
        throw new Error('A project with this key already exists for your team.')
    }
}
