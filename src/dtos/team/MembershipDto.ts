import { TeamMember } from '../../entities/team/TeamMember'

export interface MembershipDto {
    id: string
    role: string
    team: {
        id: string
        name: string
    }
}

export const getMembershipDto = (membership: TeamMember): MembershipDto => {
    return {
        id: membership.id,
        role: membership.role,
        team: {
            id: membership.team.id,
            name: membership.team.name
        }
    }
}
