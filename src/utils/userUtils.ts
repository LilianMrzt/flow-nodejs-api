import { UserColors } from '@constants/UserColors'

export const getRandomColor = (): string => {
    const index = Math.floor(Math.random() * UserColors.length)
    return UserColors[index]
}
