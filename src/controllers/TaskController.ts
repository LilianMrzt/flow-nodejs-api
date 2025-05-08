import { Request, Response } from 'express'
import { Project } from '../entities/project/Project'
import { AppDataSource } from '../config/connectDatabase'
import { ResponseMessages } from '../constants/ResponseMessages'
import { Task } from '../entities/task/Task'
import { BoardColumn } from '../entities/board-column/BoardColumn '

/**
 * Crée une tâche pour un projet
 */
export const createTask = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { slug } = req.params

        const { title, description, columnId } = req.body

        const project = await AppDataSource.getRepository(Project).findOne({
            where: { slug },
            relations: ['team']
        })

        if (!project) return res.status(404).json({ message: ResponseMessages.projectNotFound })

        const task = new Task()
        task.title = title
        task.description = description
        task.project = project

        if (columnId) {
            const column = await AppDataSource.getRepository(BoardColumn).findOneBy({ id: columnId })
            if (!column) return res.status(404).json({ message: ResponseMessages.boardColumnNotFound })
            task.column = column
        }

        const savedTask = await AppDataSource.getRepository(Task).save(task)
        return res.status(201).json(savedTask)
    } catch (error) {
        console.error('Error creating task:', error)
        return res.status(500).json({ message: ResponseMessages.internalServerError })
    }
}
