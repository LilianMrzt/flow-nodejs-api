import { AppDataSource } from '@config/connectDatabase'
import { Task } from '@entities/task/Task'
import { IsNull } from 'typeorm'

/**
 * Réorganise les tâches dans une colonne donnée (ou backlog si null)
 * @param projectId
 * @param columnId
 */
export const reorderTasksInColumnService = async (
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
