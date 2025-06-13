import { Project } from '@entities/project/Project'
import { getProjectMemberDto, ProjectMemberDto } from '@dtos/projects/ProjectMemberDto'
import { BoardColumn } from '@entities/board-column/BoardColumn '

export interface ProjectDetailsDto {
    id: string
    name: string
    key: string
    description?: string
    createdAt: Date
    updatedAt: Date
    totalTasksNumber: number
    members: ProjectMemberDto[]
    columns: BoardColumn[]
}

export const getProjectDetailsDTO = (project: Project): ProjectDetailsDto => {
    return {
        id: project.id,
        name: project.name,
        key: project.key,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        totalTasksNumber: project.totalTasksNumber,
        members: project.members.map(getProjectMemberDto),
        columns: project.columns
    }
}
