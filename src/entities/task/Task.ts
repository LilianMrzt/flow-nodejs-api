import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from '../project/Project'
import { BoardColumn } from '../board-column/BoardColumn '

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column()
        title!: string

    @Column({ type: 'text' })
        description!: string

    @ManyToOne(() => {
        return Project
    }, project => {
        return project.tasks
    }, { onDelete: 'CASCADE' })
        project!: Project

    @ManyToOne(() => {
        return BoardColumn
    }, column => {
        return column.tasks
    }, { nullable: true, onDelete: 'SET NULL' })
        column?: BoardColumn

    @CreateDateColumn()
        createdAt!: Date

    @UpdateDateColumn()
        updatedAt!: Date
}
