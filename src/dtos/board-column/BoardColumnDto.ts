import { BoardColumn } from '../../entities/board-column/BoardColumn '

export interface BoardColumnDto {
    id: string
    name: string
    color: string
    order: number
}

export const getBoardColumnDto = (column: BoardColumn): BoardColumnDto => {
    return {
        id: column.id,
        name: column.name,
        color: column.color,
        order: column.order
    }
}
