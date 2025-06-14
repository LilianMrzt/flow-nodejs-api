import { AppDataSource } from '@config/connectDatabase'
import { ResponseMessages } from '@constants/ResponseMessages'
import { BoardColumn } from '@entities/board-column/BoardColumn'

/**
 * Récupère une colonne via son ID
 * @param columnId
 */
export const findBoardColumnByIdService = async (
    columnId: string
): Promise<BoardColumn> => {
    const column = await AppDataSource.getRepository(BoardColumn).findOneBy({ id: columnId })
    if (!column) throw new Error(ResponseMessages.boardColumnNotFound)
    return column
}
