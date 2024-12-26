import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { NodemailerProvider } from '~/providers/NodemailerProvider'

const create = async (account) => {
  try {
    const existedUser = await userModel.find(null, account.email)

    if (existedUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    const nameFromEmail = account.email.split('@')[0]

    const createdAccount = await userModel.create({
      email: account.email,
      password: bcryptjs.hashSync(account.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    })

    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${account.email}&token=${account.verifyToken}`
    const customSubject = 'Please verify your email before using our services!'
    const htmlContent = `<p>Here is your verification link:</p><p>${verificationLink}</p><p>Sincerely, <br/>minhuy</p>`

    await NodemailerProvider.sendEmail(
      account.email,
      customSubject,
      htmlContent
    )

    return pickUser(await userModel.find(createdAccount.insertedId))
  } catch (error) {
    throw error
  }
}

export const userService = { create }
