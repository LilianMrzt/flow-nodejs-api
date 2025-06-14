import { AppDataSource } from '@config/connectDatabase'
import { Task } from '@entities/task/Task'

/**
 * Récupère une tâche via son ID et l'ID de son projet
 * @param taskId
 * @param projectId
 */
export const findTaskByIdAndProjectService = async (
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
