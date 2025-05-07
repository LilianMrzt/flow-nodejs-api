import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    Unique
} from 'typeorm'
import { Project } from './Project'
import { User } from '../user/User'
import { ProjectRole } from '../../constants/ProjectRole'

@Entity()
@Unique(['user', 'project'])
export class ProjectMember {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @ManyToOne(() => {
        return User
    }, { eager: true })
        user!: User

    @ManyToOne(() => {
        return Project
    }, project => {
        return project.members
    }, { onDelete: 'CASCADE' })
        project!: Project

    @Column({ type: 'enum', enum: ProjectRole, default: ProjectRole.READ })
        role!: ProjectRole
}
