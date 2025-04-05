import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import OtpGenerator from 'otp-generator'
import { NodemailerProvider } from '~/providers/nodemailer.provider'
import { JwtProvider } from '~/providers/jwt.provider'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import { env } from '~/config/environment'
import { userRepository } from './user.repo'
import { OtpSchema, PasswordResetTokenSchema } from './user.model'
import { cloudinarySecureUrl2PublicId, pickUser } from '~/utils/formatter'
import CustomAPIError from '~/utils/CustomAPIError'
import { WEBSITE_DOMAIN } from '~/utils/constants'

const verifyOTP = async (body) => {
  try {
    const otp = await userRepository.find({
      collectionName: env.MONGODB_OTPS_COLLECTION_NAME,
      email: body.email
    })

    if (otp && otp.expireAt < Date.now()) {
      await userRepository.erase({
        collectionName: env.MONGODB_PASSWORD_RESET_TOKENS_COLLECTION_NAME,
        email: body.email
      })
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'OTP has expired'
      )
    }
    if (!bcryptjs.compareSync(body.otp, otp.hashOtp) || !otp) {
      throw new CustomAPIError(StatusCodes.UNPROCESSABLE_ENTITY, 'Invalid OTP')
    }
    return true
  } catch (error) {
    throw error
  }
}

const verifyPasswordResetToken = async ({ email, token }) => {
  try {
    const passwordResetToken = await userRepository.find({
      collectionName: env.MONGODB_PASSWORD_RESET_TOKENS_COLLECTION_NAME,
      email
    })

    if (passwordResetToken && passwordResetToken.expireAt < Date.now()) {
      await userRepository.erase({
        collectionName: env.MONGODB_PASSWORD_RESET_TOKENS_COLLECTION_NAME,
        email
      })
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Token has expired'
      )
    }
    if (passwordResetToken.token !== token || !passwordResetToken) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Invalid token'
      )
    }
    return true
  } catch (error) {
    throw error
  }
}

const register = async ({ username, email, password }) => {
  try {
    const existedUsername = await userRepository.findUser('username', username)

    if (existedUsername) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Username already exists'
      )
    }
    const existedEmail = await userRepository.findUser('email', email)

    if (existedEmail) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Email already exists'
      )
    }
    const user = await userRepository.findUser(
      '_id',
      (
        await userRepository.createUser({
          username,
          email,
          password: bcryptjs.hashSync(password, 8),
          displayName: username,
          isVerified: false
        })
      ).insertedId
    )

    return user
  } catch (error) {
    throw error
  }
}

const verifyUser = async ({ email, otp }) => {
  try {
    const existedUser = await userRepository.findUser('email', email)

    if (!existedUser)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User not found'
      )

    if (existedUser.isVerified)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User is already verified'
      )

    if (await verifyOTP({ otp, email })) {
      const [user] = await Promise.all([
        userRepository.updateUser(existedUser._id, {
          isVerified: true
        }),
        userRepository.erase({
          collectionName: env.MONGODB_OTPS_COLLECTION_NAME,
          email
        })
      ])
      return pickUser(user)
    }
  } catch (error) {
    throw error
  }
}

const sendOtp = async ({ email }) => {
  try {
    const existedUser = await userRepository.findUser('email', email)

    if (!existedUser)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User not found'
      )

    if (existedUser.isVerified)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User is already verified'
      )

    let otp = OtpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    })

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
    await Promise.all([
      userRepository.upsert({
        collectionName: env.MONGODB_OTPS_COLLECTION_NAME,
        schema: OtpSchema,
        body: { otp, email }
      }),
      NodemailerProvider.sendEmail(email, customSubject, htmlContent)
    ])
    return {
      message: 'OTP has been sent to your email'
    }
  } catch (error) {
    throw error
  }
}

const login = async ({ username, email, password }) => {
  try {
    const existedUser = await userRepository.findUserByEmailOrUsername(
      email,
      username
    )

    if (!existedUser) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User not found'
      )
    }

    if (!bcryptjs.compareSync(password, existedUser.password)) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Incorrect password'
      )
    }

    const [accessToken, refreshToken] = await Promise.all([
      JwtProvider.generateToken(
        { id: existedUser._id, email: existedUser.email },
        env.ACCESS_TOKEN_PRIVATE_KEY,
        env.ACCESS_TOKEN_EXPIRES
      ),
      JwtProvider.generateToken(
        { id: existedUser._id, email: existedUser.email },
        env.REFRESH_TOKEN_PRIVATE_KEY,
        env.REFRESH_TOKEN_EXPIRES
      )
    ])

    return { accessToken, refreshToken, user: pickUser(existedUser) }
  } catch (error) {
    throw error
  }
}

const forgotPassword = async ({ email, username }) => {
  try {
    const existedUser = await userRepository.findUserByEmailOrUsername(
      email,
      username
    )

    if (!existedUser) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User not found'
      )
    }

    const token = uuid()

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
    await Promise.all([
      userRepository.upsert({
        collectionName: env.MONGODB_PASSWORD_RESET_TOKENS_COLLECTION_NAME,

        schema: PasswordResetTokenSchema,
        body: { token, email }
      }),
      NodemailerProvider.sendEmail(
        existedUser.email,
        customSubject,
        htmlContent
      )
    ])
    return { message: 'Reset password link has been sent to your email' }
  } catch (error) {
    throw error
  }
}

const resetPassword = async ({ email, password, token }) => {
  try {
    const existedUser = await userRepository.findUser('email', email)

    if (!existedUser)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User not found'
      )

    if (await verifyPasswordResetToken({ token, email })) {
      await Promise.all([
        userRepository.updateUser(existedUser._id, {
          password: bcryptjs.hashSync(password, 8)
        }),
        userRepository.erase({
          collectionName: env.MONGODB_PASSWORD_RESET_TOKENS_COLLECTION_NAME,

          email
        })
      ])
      return { message: 'Reset password link has been sent to your email' }
    }
  } catch (error) {
    throw error
  }
}

const updateUser = async (
  id,
  { displayName, currentPassword, newPassword },
  avatar
) => {
  try {
    const user = await userRepository.findUser('_id', id)

    if (!user)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User not found'
      )
    if (!user.isVerified)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Your account is not verified'
      )

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
        throw new CustomAPIError(StatusCodes.FORBIDDEN, 'Incorrect password')
      updateUser.password = bcryptjs.hashSync(newPassword, 8)
    }

    const updatedUser = await userRepository.updateUser(user._id, {
      ...updateUser,
      updatedAt: Date.now()
    })

    if (updatedUser.avatar && avatar && user.avatar) {
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

const deleteAvatar = async (id) => {
  try {
    const user = await userRepository.findUser('_id', id)

    if (!user)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'User not found'
      )

    if (!user.isVerified)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Your account is not verified'
      )

    const updatedUser = await userRepository.updateUser(id, {
      avatar: null,
      updatedAt: Date.now()
    })

    updatedUser &&
      (await CloudinaryProvider.deleteImage(
        cloudinarySecureUrl2PublicId(
          `${env.PROJECT_NAME}/${env.CLOUDINARY_USERS_COLLECTION_NAME}/${user.username}/avatar`,
          user.avatar
        )
      ))

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const refreshToken = async (refreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.isVerified(
      refreshToken,
      env.REFRESH_TOKEN_PRIVATE_KEY
    )

    const accessToken = await JwtProvider.generateToken(
      { id: refreshTokenDecoded.id, email: refreshTokenDecoded.email },
      env.ACCESS_TOKEN_PRIVATE_KEY,
      env.ACCESS_TOKEN_EXPIRES
    )

    return { accessToken, refreshToken }
  } catch (error) {
    throw error
  }
}

export const userService = {
  register,
  verifyUser,
  sendOtp,
  forgotPassword,
  resetPassword,
  login,
  updateUser,
  deleteAvatar,
  refreshToken
}
