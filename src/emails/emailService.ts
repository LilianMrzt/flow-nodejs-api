import nodemailer from 'nodemailer'
import process from 'process'

const isDev = process.env.NODE_ENV !== 'production'

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    ...(isDev && {
        tls: {
            rejectUnauthorized: false
        }
    })
})
