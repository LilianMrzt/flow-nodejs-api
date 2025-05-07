import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { TeamMember } from '../team/TeamMember'

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

    @CreateDateColumn()
        createdAt!: Date

    @UpdateDateColumn()
        updatedAt!: Date
}
