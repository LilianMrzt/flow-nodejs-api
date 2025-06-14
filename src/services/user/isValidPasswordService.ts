/** Fonction pour valider la force du mot de passe
 * @param password
 */
export const isValidPasswordService = (
    password: string
): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/
    return passwordRegex.test(password)
}
