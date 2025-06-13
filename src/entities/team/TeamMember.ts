import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Team } from '@entities/team/Team'
import { User } from '@entities/user/User'

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
