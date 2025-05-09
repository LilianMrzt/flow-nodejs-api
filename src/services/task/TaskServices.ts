import { AppDataSource } from '../../config/connectDatabase'
import { ResponseMessages } from '../../constants/ResponseMessages'
import { BoardColumn } from '../../entities/board-column/BoardColumn '
import { Project } from '../../entities/project/Project'
import { Task } from '../../entities/task/Task'

/**
 * Récupère un projet via son slug avec ses relations associées
 * @param slug
 */
export const findProjectBySlug = async (
    slug: string
): Promise<Project> => {
    const project = await AppDataSource.getRepository(Project).findOne({
        where: { slug },
        relations: ['team']
    })

    if (!project) throw new Error(ResponseMessages.projectNotFound)
    return project
}

/**
 * Récupère une colonne via son ID
 * @param columnId
 */
export const findBoardColumnById = async (
    columnId: string
): Promise<BoardColumn> => {
    const column = await AppDataSource.getRepository(BoardColumn).findOneBy({ id: columnId })
    if (!column) throw new Error(ResponseMessages.boardColumnNotFound)
    return column
}

/**
 * Récupère une tâche via son ID et l'ID de son projet
 * @param taskId
 * @param projectId
 */
export const findTaskByIdAndProject = async (
    taskId: string,
    projectId: string
): Promise<Task> => {
    const task = await AppDataSource.getRepository(Task).findOne({
        where: { id: taskId, project: { id: projectId } },
        relations: ['project', 'column']
    })

    if (!task) throw new Error('Task not found')
    return task
}
