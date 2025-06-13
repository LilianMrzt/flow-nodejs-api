import { ProjectMember } from '@entities/project/ProjectMember'
import { UserSummaryDto } from '@dtos/user/UserSummaryDto'

export interface ProjectMemberDto {
    id: string
    role: string
    user: UserSummaryDto
}

export const getProjectMemberDto = (member: ProjectMember): ProjectMemberDto => {
    return {
        id: member.id,
        role: member.role,
        user: {
            id: member.user.id,
            email: member.user.email,
            firstName: member.user.firstName,
            lastName: member.user.lastName,
            color: member.user.color
        }
    }
}
