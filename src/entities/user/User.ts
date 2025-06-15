import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { TeamMember } from '@entities/team/TeamMember'
import { getRandomColor } from '@utils/userUtils'

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column({ unique: true })
        email!: string

    @Column()
        password!: string

    @Column({ nullable: true })
        firstName?: string

    @Column({ nullable: true })
        lastName?: string

    @OneToMany(() => {
        return TeamMember
    }, member => {
        return member.user
    })
        memberships!: TeamMember[]

    @Column({ default: () => {
        return `'${getRandomColor()}'`
    } })
        color!: string

    @Column({ default: 'local' })
        authProvider!: 'local' | 'google'

    @CreateDateColumn()
        createdAt!: Date

    @UpdateDateColumn()
        updatedAt!: Date
}
