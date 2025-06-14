import { AppDataSource } from '@config/connectDatabase'
import { Task } from '@entities/task/Task'

/**
 * Récupère le prochain ordre disponible dans une colonne
 * @param columnId
 */
export const getNextOrderInColumnService = async (columnId: string): Promise<number> => {
    const task = await AppDataSource.getRepository(Task).findOne({
        where: { column: { id: columnId } },
        order: { orderInColumn: 'DESC' }
    })
    return task?.orderInColumn != null ? task.orderInColumn + 1 : 0
}
