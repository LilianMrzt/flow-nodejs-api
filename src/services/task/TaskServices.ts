import { AppDataSource } from '../../config/connectDatabase'
import { ResponseMessages } from '../../constants/ResponseMessages'
import { BoardColumn } from '../../entities/board-column/BoardColumn '
import { Project } from '../../entities/project/Project'
import { Task } from '../../entities/task/Task'
import { IsNull } from 'typeorm'

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

/**
 * Récupère le prochain ordre disponible dans une colonne
 * @param columnId
 */
export const getNextOrderInColumn = async (columnId: string): Promise<number> => {
    const task = await AppDataSource.getRepository(Task).findOne({
        where: { column: { id: columnId } },
        order: { orderInColumn: 'DESC' }
    })
    return task?.orderInColumn != null ? task.orderInColumn + 1 : 0
}

/**
 * Récupère le prochain ordre disponible dans le backlog
 * @param projectId
 */
export const getNextOrderInBacklog = async (projectId: string): Promise<number> => {
    const task = await AppDataSource.getRepository(Task).findOne({
        where: { project: { id: projectId } },
        order: { orderInBacklog: 'DESC' }
    })
    return task?.orderInBacklog != null ? task.orderInBacklog + 1 : 0
}

/**
 * Réorganise les tâches dans une colonne donnée (ou backlog si null)
 * @param projectId
 * @param columnId
 */
export const reorderTasksInColumn = async (
    projectId: string,
    columnId: string | null
): Promise<Task[]> => {
    const taskRepo = AppDataSource.getRepository(Task)

    const tasks = await taskRepo.find({
        where: {
            project: { id: projectId },
            column: columnId === null ? IsNull() : { id: columnId }
        },
        order: { orderInColumn: 'ASC' },
        relations: ['column']
    })

    for (let i = 0; i < tasks.length; i++) {
        tasks[i].orderInColumn = i
    }

    return await taskRepo.save(tasks)
}

/**
 * Prépare les tâches à mettre à jour avec nouvelle colonne + ordre, et détecte les colonnes à réordonner.
 * @param updates
 * @param projectId
 */
export const prepareColumnTasksUpdate = async (
    updates: { id: string, columnId: string | null, orderInColumn: number }[],
    projectId: string
): Promise<{ tasksToUpdate: Task[], columnsToReorder: Set<string | null> }> => {
    const tasksToUpdate: Task[] = []
    const columnsToReorder = new Set<string | null>()

    for (const update of updates) {
        const task = await findTaskByIdAndProject(update.id, projectId)
        const previousColumnId = task.column?.id ?? null

        if (previousColumnId !== update.columnId) {
            columnsToReorder.add(previousColumnId)
            columnsToReorder.add(update.columnId ?? null)
        }

        task.column = update.columnId ? await findBoardColumnById(update.columnId) : null
        task.orderInColumn = update.columnId != null ? update.orderInColumn : null
        tasksToUpdate.push(task)
    }

    return { tasksToUpdate, columnsToReorder }
}
