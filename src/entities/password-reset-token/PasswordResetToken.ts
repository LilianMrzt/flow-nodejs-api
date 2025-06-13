import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn
} from 'typeorm'
import { User } from '@entities/user/User'

@Entity()
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column({ unique: true })
        token!: string

    @ManyToOne(() => {
        return User
    }, { onDelete: 'CASCADE' })
    @JoinColumn()
        user!: User

    @Column()
        expiresAt!: Date

    @CreateDateColumn()
        createdAt!: Date
}
