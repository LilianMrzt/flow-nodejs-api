import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Unique, ManyToOne
} from 'typeorm'
import { ProjectMember } from './ProjectMember'
import { Team } from '../team/Team'
import { BoardColumn } from '../board-column/BoardColumn '
import { Task } from '../task/Task'

@Entity()
@Unique(['key', 'team'])
export class Project {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column()
        name!: string

    @Column({ type: 'text', nullable: true })
        description?: string

    @Column()
        key!: string

    @OneToMany(() => {
        return ProjectMember
    }, member => {
        return member.project
    }, { cascade: true })
        members!: ProjectMember[]

    @ManyToOne(() => {
        return Team
    }, team => {
        return team.projects
    })
        team!: Team

    @OneToMany(() => {
        return BoardColumn
    }, column => {
        return column.project
    }, { cascade: true })
        columns!: BoardColumn[]

    @OneToMany(() => {
        return Task
    }, task => {
        return task.project
    }, { cascade: true })
        tasks!: Task[]

    @Column({ type: 'int', default: 0 })
        totalTasksNumber!: number

    @CreateDateColumn()
        createdAt!: Date

    @UpdateDateColumn()
        updatedAt!: Date
}
