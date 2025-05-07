import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    BeforeInsert
} from 'typeorm'
import { ProjectMember } from './ProjectMember'
import { slugify } from '../../utils/slugify'
import { AppDataSource } from '../../config/connectDatabase'

@Entity()
export class Project {
    @PrimaryGeneratedColumn('uuid')
        id!: string

    @Column()
        name!: string

    @Column({ type: 'text', nullable: true })
        description?: string

    @Column({ unique: true })
        slug!: string

    @OneToMany(() => {
        return ProjectMember
    }, member => {
        return member.project
    }, { cascade: true })
        members!: ProjectMember[]

    @CreateDateColumn()
        createdAt!: Date

    @UpdateDateColumn()
        updatedAt!: Date

    @BeforeInsert()
    async generateUniqueSlug(): Promise<void>{
        const projectRepository = AppDataSource.getRepository(Project)

        const baseSlug = slugify(this.name)
        let slug = baseSlug
        let i = 1

        while (await projectRepository.findOne({ where: { slug } })) {
            slug = `${baseSlug}-${i}`
            i++
        }

        this.slug = slug
    }
}
