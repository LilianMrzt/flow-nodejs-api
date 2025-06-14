/** Fonction pour valider le format de l'email
 * @param email
 */
export const isValidEmailService = (
    email: string
): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
