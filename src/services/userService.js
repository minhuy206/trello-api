import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { NodemailerProvider } from '~/providers/NodemailerProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { cloudinarySecureUrl2PublicId, pickUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { env } from '~/config/environment'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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

    const createdAccount = await userModel.find(
      '_id',
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

const verify = async ({ email, token }) => {
  try {
    const existedUser = await userModel.find('email', email)

    if (!existedUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')

    if (existedUser.isActive)
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User is already verified')

    if (existedUser.verifyToken !== token)
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token')

    await userModel.update(existedUser._id, {
      verifyToken: null,
      isActive: true
    })

    return pickUser(existedUser)
  } catch (error) {
    throw error
  }
}

const login = async ({ username, password }) => {
  try {
    const existedEmail = await userModel.find('email', username)
    const existedUsername = await userModel.find('username', username)

    if (!existedEmail && !existedUsername) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const existedUser = existedEmail ?? existedUsername

    if (!existedUser.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User is not verified')
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

const update = async (
  id,
  { displayName, currentPassword, newPassword },
  avatar
) => {
  try {
    const user = await userModel.find('_id', id)

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    if (!user.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your account is not verified'
      )

    const updateUser = {}

    displayName && (updateUser.displayName = displayName)
    avatar &&
      (updateUser.avatar = (
        await CloudinaryProvider.uploadImage(
          avatar?.buffer,
          `${env.CLOUDINARY_USERS_COLLECTION_NAME}/${user.username}/avatar`
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

    const updatedUser = await userModel.find(
      '_id',
      (
        await userModel.update(user._id, {
          ...updateUser,
          updatedAt: Date.now()
        })
      )._id
    )

    if (user.avatar && avatar) {
      await CloudinaryProvider.deleteImage(
        cloudinarySecureUrl2PublicId(
          `${env.CLOUDINARY_USERS_COLLECTION_NAME}/${user.username}/avatar`,
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

export const userService = { create, verify, login, update, refreshToken }
