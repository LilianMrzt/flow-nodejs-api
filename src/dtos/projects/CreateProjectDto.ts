import { Project } from '../../entities/project/Project'

export interface CreateProjectDto {
    name: string
    key: string
    description?: string
}

export const getCreateProjectDTO = (project: Project): CreateProjectDto => {
    return {
        name: project.name,
        key: project.key,
        description: project.description
    }
}
