import { BoardColumnDto, getBoardColumnDto } from '../board-column/BoardColumnDto'
import { getUserSummaryDto, UserSummaryDto } from '../user/UserSummaryDto'
import { Task } from '../../entities/task/Task'

export interface TaskLightDto {
    id: string
    key: string
    title: string
    type: string
    priority: string
    column: BoardColumnDto | null
    assignedUser: UserSummaryDto | null
    orderInColumn?: number | null
    orderInBacklog?: number | null
}

export const getTaskLightDto = (task: Task): TaskLightDto => {
    return {
        id: task.id,
        key: task.key,
        title: task.title,
        type: task.type,
        priority: task.priority,
        column: task.column ? getBoardColumnDto(task.column) : null,
        assignedUser: task.assignedUser ? getUserSummaryDto(task.assignedUser) : null,
        orderInColumn: task.orderInColumn,
        orderInBacklog: task.orderInBacklog
    }
}
