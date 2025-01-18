import { env } from '~/config/environment'
import nodemailer from 'nodemailer'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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
  return (await transporter.sendMail({
    from: '"minhuy" <vominhhuy0911@gmail.com>',
    to: recipientEmail,
    subject: customSubject,
    html: htmlContent
  }))
    ? 'Sent'
    : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send email')
}

export const NodemailerProvider = {
  sendEmail
}
