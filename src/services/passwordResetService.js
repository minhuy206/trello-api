import { StatusCodes } from 'http-status-codes'
import { passwordResetModel } from '~/models/passwordResetModel'
import CustomAPIError from '~/utils/CustomAPIError'

const createOrUpdate = async (token, email) => {
  try {
    return (await passwordResetModel.createOrUpdate(token, email)) ? 1 : 0
  } catch (error) {
    throw error
  }
}

const verify = async (token, email) => {
  try {
    const passwordResets = await passwordResetModel.find(email)

    if (!passwordResets.length) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Token not found')
    }

    if (!(passwordResets[passwordResets.length - 1].token === token)) {
      throw new CustomAPIError(StatusCodes.NOT_ACCEPTABLE, 'Invalid token')
    }
    await passwordResetModel.deletePasswordResets(email)
    return true
  } catch (error) {
    throw error
  }
}

const deletePasswordReset = async (email) => {
  try {
    return await passwordResetModel.deletePasswordResets(email)
  } catch (error) {
    throw error
  }
}

export const passwordResetService = {
  createOrUpdate,
  verify,
  deletePasswordReset
}
