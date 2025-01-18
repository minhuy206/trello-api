import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { NodemailerProvider } from '~/providers/NodemailerProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { cloudinarySecureUrl2PublicId, pickUser } from '~/utils/formatter'
import { env } from '~/config/environment'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import OtpGenerator from 'otp-generator'
import { otpService } from './otpService'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { v4 as uuid } from 'uuid'
import { passwordResetModel } from '~/models/passwordResetModel'
import { passwordResetService } from './passwordResetService'

const create = async ({ username, email, password }) => {
  try {
    const existedUsername = await userModel.find('username', username)

    if (existedUsername) {
      throw new ApiError(StatusCodes.CONFLICT, 'Username already exists')
    }
    const existedEmail = await userModel.find('email', email)

    if (existedEmail) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    await userModel.find(
      '_id',
      (
        await userModel.create({
          username,
          email,
          password: bcryptjs.hashSync(password, 8),
          displayName: username,
          isVerified: false
        })
      ).insertedId
    )

    return 'Account created'
  } catch (error) {
    throw error
  }
}

const verify = async ({ email, otp }) => {
  try {
    const existedUser = await userModel.find('email', email)

    if (!existedUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')

    if (existedUser.isVerified)
      throw new ApiError(StatusCodes.CONFLICT, 'User is already verified')

    if (await otpService.verify(otp, email)) {
      return pickUser(
        await userModel.update(existedUser._id, {
          isVerified: true
        })
      )
    }
  } catch (error) {
    throw error
  }
}

const sendOtp = async ({ email }) => {
  try {
    const existedUser = await userModel.find('email', email)

    if (!existedUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')

    if (existedUser.isVerified)
      throw new ApiError(StatusCodes.CONFLICT, 'User is already verified')

    let otp = OtpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    })

    await otpService.create(otp, email)

    const customSubject = 'Please verify your email before using our services!'
    const htmlContent = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #512da8;text-decoration:none;font-weight:600">${env.AUTHOR}</a>
        </div>
        <p style="font-size:1.1em">Hi, ${existedUser.username}</p>
        <p>Thank you for register. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
        <h2 style="background: #512da8;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />${env.AUTHOR}</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>${env.AUTHOR}</p>
        <p>Ho Chi Minh City</p>
        <p>Vietnam</p>
      </div>
      </div>
    </div>`
    return await NodemailerProvider.sendEmail(email, customSubject, htmlContent)
  } catch (error) {
    throw error
  }
}

const login = async ({ username, email, password }) => {
  try {
    const existedUser = await userModel.find(
      username ? 'username' : 'email',
      username ?? email
    )

    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    if (!bcryptjs.compareSync(password, existedUser.password)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect password')
    }

    const accessToken = await JwtProvider.generateToken(
      { id: existedUser._id, email: existedUser.email },
      env.ACCESS_TOKEN_PRIVATE_KEY,
      env.ACCESS_TOKEN_EXPIRES
    )

    const refreshToken = await JwtProvider.generateToken(
      { id: existedUser._id, email: existedUser.email },
      env.REFRESH_TOKEN_PRIVATE_KEY,
      env.REFRESH_TOKEN_EXPIRES
    )

    return { accessToken, refreshToken, ...pickUser(existedUser) }
  } catch (error) {
    throw error
  }
}

const forgotPassword = async ({ email, username }) => {
  try {
    const existedUser = await userModel.find(
      username ? 'username' : 'email',
      username ?? email
    )

    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const token = uuid()

    await passwordResetModel.create(token, existedUser.email)

    const resetPasswordLink = `${WEBSITE_DOMAIN}/reset-password?email=${existedUser.email}&token=${token}`
    const htmlContent = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #512da8;text-decoration:none;font-weight:600">${env.AUTHOR}</a>
        </div>
        <p style="font-size:1.1em">Hi, ${existedUser.username}</p>
        <p>Here is your reset password link. Click the following URL to reset your password. This link is valid for 5 minutes</p>
        <a href="${resetPasswordLink}">${resetPasswordLink}</a>
        <p style="font-size:0.9em;">Regards,<br />${env.AUTHOR}</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>${env.AUTHOR}</p>
        <p>Ho Chi Minh City</p>
        <p>Vietnam</p>
      </div>
      </div>
    </div>`
    const customSubject = 'Reset your password!'
    return await NodemailerProvider.sendEmail(
      existedUser.email,
      customSubject,
      htmlContent
    )
  } catch (error) {
    throw error
  }
}

const resetPassword = async ({ email, password, token }) => {
  try {
    const existedUser = await userModel.find('email', email)

    if (!existedUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')

    if (await passwordResetService.verify(token, email)) {
      await userModel.update(existedUser._id, {
        password: bcryptjs.hashSync(password, 8),
        updatedAt: Date.now()
      })
    }
  } catch (error) {
    throw error
  }
}

const update = async (
  id,
  { displayName, currentPassword, newPassword },
  avatar
) => {
  try {
    const user = await userModel.find('_id', id)

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    if (!user.isVerified)
      throw new ApiError(StatusCodes.FORBIDDEN, 'Your account is not verified')

    const updateUser = {}

    displayName && (updateUser.displayName = displayName)

    avatar &&
      (updateUser.avatar = (
        await CloudinaryProvider.uploadImage(
          avatar?.buffer,
          `${env.PROJECT_NAME}/${env.CLOUDINARY_USERS_COLLECTION_NAME}/${user.username}/avatar`
        )
      )?.secure_url)

    if (currentPassword && newPassword) {
      if (!bcryptjs.compareSync(currentPassword, user.password))
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect password')
      updateUser.password = bcryptjs.hashSync(newPassword, 8)
    }
    // if (avatar || avatar === '') {
    //   updateUser.avatar =
    //     avatar === ''
    //       ? avatar
    //       : (
    //           await CloudinaryProvider.uploadImage(
    //             avatar?.buffer,
    //             env.CLOUDINARY_USER_AVATAR_COLLECTION_NAME
    //           )
    //         )?.secure_url
    // }

    const updatedUser = await userModel.update(user._id, {
      ...updateUser,
      updatedAt: Date.now()
    })

    if (user.avatar && avatar) {
      await CloudinaryProvider.deleteImage(
        cloudinarySecureUrl2PublicId(
          `${env.PROJECT_NAME}/${env.CLOUDINARY_USERS_COLLECTION_NAME}/${user.username}/avatar`,
          user.avatar
        )
      )
    }

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const refreshToken = async (refreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      refreshToken,
      env.REFRESH_TOKEN_PRIVATE_KEY
    )

    const accessToken = await JwtProvider.generateToken(
      { id: refreshTokenDecoded.id, email: refreshTokenDecoded.email },
      env.ACCESS_TOKEN_PRIVATE_KEY,
      env.ACCESS_TOKEN_EXPIRES
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

export const userService = {
  create,
  verify,
  sendOtp,
  forgotPassword,
  resetPassword,
  login,
  update,
  refreshToken
}
