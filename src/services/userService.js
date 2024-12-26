import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { NodemailerProvider } from '~/providers/NodemailerProvider'

const create = async ({ username, email, password }) => {
  try {
    const existedUsername = await userModel.find(null, username)

    if (existedUsername) {
      throw new ApiError(StatusCodes.CONFLICT, 'Username already exists')
    }
    const existedEmail = await userModel.find(null, null, email)

    if (existedEmail) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    const createdAccount = await userModel.find(
      (
        await userModel.create({
          username,
          email,
          password: bcryptjs.hashSync(password, 8),
          displayName: username,
          verifyToken: uuidv4()
        })
      ).insertedId
    )

    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${createdAccount.email}&token=${createdAccount.verifyToken}`
    const customSubject = 'Please verify your email before using our services!'
    const htmlContent = `<p>Hi ${createdAccount.username}!</p><p>Here is your verification link:</p><p>${verificationLink}</p><p>Sincerely, <br/>minhuy</p>`

    await NodemailerProvider.sendEmail(email, customSubject, htmlContent)

    return pickUser(createdAccount)
  } catch (error) {
    throw error
  }
}

export const userService = { create }
