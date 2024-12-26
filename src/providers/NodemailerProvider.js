import { env } from '~/config/environment'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: 'vominhhuy0911@gmail.com',
    pass: 'hhmboydxssypvoye'
  }
})

let sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  return await transporter.sendMail({
    from: 'minhuy', // sender address
    to: recipientEmail, // list of receivers
    subject: customSubject, // Subject line
    html: htmlContent // html body
  })
}

export const NodemailerProvider = {
  sendEmail
}
