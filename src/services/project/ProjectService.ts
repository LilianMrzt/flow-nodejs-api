import { AppDataSource } from '../../config/connectDatabase'
import { Project } from '../../entities/project/Project'

/**
 * Vérifie que la clé est valide et unique pour l'équipe donnée
 * @param key - La clé du projet
 * @param teamId - L'ID de l'équipe
 * @throws Error si la clé est vide ou déjà utilisée
 */
export const validateProjectKey = async (key: string, teamId: string): Promise<void> => {
    if (!key || key.trim() === '') {
        throw new Error('Project key is required.')
    }

    const projectRepo = AppDataSource.getRepository(Project)

    const existing = await projectRepo.findOne({
        where: {
            key,
            team: { id: teamId }
        },
        relations: ['team']
    })

    if (existing) {
        throw new Error('A project with this key already exists for your team.')
    }
}
