import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    BeforeInsert,
    Unique, ManyToOne
} from 'typeorm'
import { ProjectMember } from './ProjectMember'
import { slugify } from '../../utils/slugify'
import { AppDataSource } from '../../config/connectDatabase'
import { Team } from '../team/Team'

@Entity()
@Unique(['slug', 'team'])
export class Project {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column()
        name!: string

    @Column({ type: 'text', nullable: true })
        description?: string

    @Column()
        slug!: string

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

    @CreateDateColumn()
        createdAt!: Date

    @UpdateDateColumn()
        updatedAt!: Date

    @BeforeInsert()
    async generateUniqueSlug(): Promise<void>{
        if (!this.team) {
            throw new Error('Cannot generate slug without a team')
        }

        const projectRepository = AppDataSource.getRepository(Project)
        const baseSlug = slugify(this.name)
        let slug = baseSlug
        let i = 1

        while (
            await projectRepository.findOne({
                where: {
                    slug,
                    team: { id: this.team.id }
                },
                relations: ['team']
            })
        ) {
            slug = `${baseSlug}-${i}`
            i++
        }

        this.slug = slug
    }
}
