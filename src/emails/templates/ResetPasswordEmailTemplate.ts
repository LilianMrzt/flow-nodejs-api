import { transporter } from '@src/emails/emailService'
import process from 'process'

/**
 * Email envoyé pour la réinitialisation du mot de passe
 * @param to
 * @param resetUrl
 */
export const sendResetPasswordEmail = async (to: string, resetUrl: string): Promise<void> => {
    await transporter.sendMail({
        from: `"PowerVision Support" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Reset your PowerVision password',
        html: `
    <p>Hello,</p>
    <p>You requested to reset your PowerVision password.</p>
    <p>Click the link below to set a new password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link will expire in 15 minutes.</p>
    <p>If you did not request this change, please ignore this email or contact our support.</p>
  `
    })
}
