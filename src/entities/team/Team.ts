import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from '../project/Project'
import { TeamMember } from './TeamMember'

@Entity()
export class Team {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column()
        name!: string

    @OneToMany(() => {
        return TeamMember
    }, member => {
        return member.team
    }, { cascade: true })
        members!: TeamMember[]

    @OneToMany(() => {
        return Project
    }, project => {
        return project.team
    })
        projects!: Project[]

    @CreateDateColumn()
        createdAt!: Date

    @UpdateDateColumn()
        updatedAt!: Date
}
