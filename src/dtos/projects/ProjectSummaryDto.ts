import { Project } from '../../entities/project/Project'

export interface ProjectSummaryDto {
    id: string
    name: string
    key: string
    description?: string
    createdAt: Date
    updatedAt: Date
    totalTasksNumber: number
}

export const getProjectSummaryDTO = (project: Project): ProjectSummaryDto => {
    return {
        id: project.id,
        name: project.name,
        key: project.key,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        totalTasksNumber: project.totalTasksNumber
    }
}
