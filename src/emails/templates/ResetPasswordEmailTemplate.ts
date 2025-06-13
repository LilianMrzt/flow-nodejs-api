import { transporter } from '@src/emails/emailService'
import process from 'process'
import mjml2html from 'mjml'
import { User } from '@entities/user/User'

/**
 * Email envoyé pour la réinitialisation du mot de passe
 * @param user
 * @param resetUrl
 */
export const sendResetPasswordEmail = async (user: User, resetUrl: string): Promise<void> => {
    const mjmlTemplate = `
  <mjml>
    <mj-body background-color="#f4f4f4" >
      <mj-section background-color="#ffffff" padding="10px" border-radius="8px">
        <mj-column>
            <mj-text font-size="20px" font-weight="bold" color="#333">
            Reset Your Password
          </mj-text>
          <mj-text padding="5px 25px" font-size="16px" color="#333">
            Hello  ${user.firstName || 'there'},
          </mj-text>
          <mj-text padding="5px 25px" font-size="16px" color="#333">
            You requested to reset your Flow password.
          </mj-text>
          <mj-text padding="5px 25px" font-size="16px" color="#333">
            Click the button below to reset it.
          </mj-text>
          <mj-button href="${resetUrl}" background-color="#4a90e2" color="white" font-size="16px" border-radius="4px" padding="20px 0">
            Reset Password
          </mj-button>
          <mj-text padding="5px 25px" font-size="14px" color="#888">
            This link will expire in 15 minutes.
          </mj-text>
          <mj-text padding="5px 25px" font-size="14px" color="#888">
            If you didn’t request this change, you can safely ignore this email.
          </mj-text>
          <mj-text font-size="16px" font-weight="bold" color="#333">
            The Flow team.
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `

    const htmlOutput = mjml2html(mjmlTemplate)

    await transporter.sendMail({
        from: `"Flow Support" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Reset your Flow password',
        html: htmlOutput.html
    })
}
