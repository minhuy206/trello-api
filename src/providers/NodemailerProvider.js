import { env } from '~/config/environment'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: env.SMTP_SERVER,
  port: env.SMTP_PORT,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD
  }
})

let sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  return await transporter.sendMail({
    from: '"minhuy" <vominhhuy0911@gmail.com>',
    to: recipientEmail,
    subject: customSubject,
    html: htmlContent
  })
}

export const NodemailerProvider = {
  sendEmail
}
