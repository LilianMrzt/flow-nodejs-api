import { transporter } from '@src/emails/emailService'
import process from 'process'
import mjml2html from 'mjml'
import { User } from '@entities/user/User'

export const sendUserVerificationEmail = async (
    user: User
): Promise<void> => {
    const verifyUrl = `${process.env.REACT_APP_FRONT_BASE_URL}/auth/verify-email?token=${user.emailVerificationToken}`

    const mjmlTemplate = `
    <mjml>
      <mj-body background-color="#f4f4f4">
        <mj-section background-color="#ffffff" padding="10px" border-radius="8px">
          <mj-column>
              <mj-text font-size="20px" font-weight="bold" color="#333">Verify Your Email</mj-text>
              <mj-text font-size="16px" color="#333">Hi ${user.firstName || 'there'},</mj-text>
              <mj-text font-size="16px" color="#333">Thanks for registering on Flow! Click the button below to verify your email.</mj-text>
              <mj-button href="${verifyUrl}" background-color="#4a90e2" color="white" font-size="16px" border-radius="4px" padding="20px 0">
                Verify Email
              </mj-button>
              <mj-text font-size="14px" color="#888">If you didn’t create an account, you can safely ignore this email.</mj-text>
              <mj-text font-size="16px" font-weight="bold" color="#333">The Flow team.</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
    `

    const htmlOutput = mjml2html(mjmlTemplate)

    await transporter.sendMail({
        from: `"Flow Support" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Verify your Flow email',
        html: htmlOutput.html
    })
}
