import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Project } from '../project/Project'
import { Task } from '../task/Task'

@Entity()
@Unique(['project', 'order'])
export class BoardColumn {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column()
        name!: string

    @Column()
        color!: string

    @Column()
        order!: number

    @ManyToOne(() => {
        return Project
    }, project => {
        return project.columns
    }, { onDelete: 'CASCADE' })
        project!: Project

    @OneToMany(() => {
        return Task
    }, task => {
        return task.column
    })
        tasks!: Task[]
}
