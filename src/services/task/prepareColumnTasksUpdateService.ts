import { Task } from '@entities/task/Task'
import { findBoardColumnByIdService } from '@services/board-column/findBoardColumnByIdService'
import {findTaskByIdAndProjectService} from "@services/task/findTaskByIdAndProjectService";

/**
 * Prépare les tâches à mettre à jour avec nouvelle colonne + ordre, et détecte les colonnes à réordonner.
 * @param updates
 * @param projectId
 */
export const prepareColumnTasksUpdateService = async (
    updates: { id: string, columnId: string | null, orderInColumn: number }[],
    projectId: string
): Promise<{ tasksToUpdate: Task[], columnsToReorder: Set<string | null> }> => {
    const tasksToUpdate: Task[] = []
    const columnsToReorder = new Set<string | null>()

    for (const update of updates) {
        const task = await findTaskByIdAndProjectService(update.id, projectId)
        const previousColumnId = task.column?.id ?? null

        columnsToReorder.add(update.columnId ?? null)

        if (previousColumnId !== update.columnId) {
            columnsToReorder.add(previousColumnId)
        }

        task.column = update.columnId ? await findBoardColumnByIdService(update.columnId) : null
        task.orderInColumn = update.columnId != null ? update.orderInColumn : null
        tasksToUpdate.push(task)
    }

    return { tasksToUpdate, columnsToReorder }
}
