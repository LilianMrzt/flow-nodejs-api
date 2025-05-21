import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from '../project/Project'
import { BoardColumn } from '../board-column/BoardColumn '
import { TaskPriority } from '../../constants/tasks/TaskPriority'
import { User } from '../user/User'
import { TaskType } from '../../constants/tasks/TaskType'

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column({ unique: true })
        key!: string

    @Column()
        title!: string

    @Column({ type: 'text' })
        description!: string

    @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
        priority!: TaskPriority

    @Column({ type: 'enum', enum: TaskType, default: TaskType.TASK })
        type!: TaskType

    @ManyToOne(() => {
        return User
    }, { nullable: true, onDelete: 'SET NULL' })
        assignedUser?: User | null

    @ManyToOne(() => {
        return User
    }, { nullable: false, onDelete: 'CASCADE' })
        reporter!: User

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
        column?: BoardColumn | null

    @Column({ type: 'int', nullable: true })
        orderInColumn?: number | null

    @Column({ type: 'int', nullable: true })
        orderInBacklog?: number | null

    @CreateDateColumn()
        createdAt!: Date

    @UpdateDateColumn()
        updatedAt!: Date
}
