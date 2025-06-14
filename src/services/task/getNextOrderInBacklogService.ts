import { AppDataSource } from '@config/connectDatabase'
import { Task } from '@entities/task/Task'
/**
 * Récupère le prochain ordre disponible dans le backlog
 * @param projectId
 */
export const getNextOrderInBacklogService = async (projectId: string): Promise<number> => {
    const task = await AppDataSource.getRepository(Task).findOne({
        where: { project: { id: projectId } },
        order: { orderInBacklog: 'DESC' }
    })
    return task?.orderInBacklog != null ? task.orderInBacklog + 1 : 0
}
