import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Team } from './Team'
import { User } from '../user/User'

@Entity()
export class TeamMember {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @ManyToOne(() => {
        return Team
    }, team => {
        return team.members
    })
        team!: Team

    @ManyToOne(() => {
        return User
    })
        user!: User

    @Column({ default: 'member' })
        role!: string
}
