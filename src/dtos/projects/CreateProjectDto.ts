import { Project } from '../../entities/project/Project'

export interface CreateProjectDto {
    name: string
    slug: string
    description?: string
}

export const getCreateProjectDTO = (project: Project): CreateProjectDto => {
    return {
        name: project.name,
        slug: project.slug,
        description: project.description
    }
}
