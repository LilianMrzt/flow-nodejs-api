export interface MembershipDto {
    id: string
    role: string
    team: {
        id: string
        name: string
    }
}
