import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { otpModel } from '~/models/otpModel'
import ApiError from '~/utils/ApiError'

const create = async (OTP, email) => {
  try {
    const hashOtp = bcryptjs.hashSync(OTP, 8)

    return (await otpModel.create(hashOtp, email)) ? 1 : 0
  } catch (error) {
    throw error
  }
}

const verify = async (OTP, email) => {
  try {
    const otps = await otpModel.find(email)

    if (!otps.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'OTP not found')
    }

    if (!bcryptjs.compareSync(OTP, otps[otps.length - 1].hashOtp)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid OTP')
    }
    await otpModel.deleteOtps(email)
    return true
  } catch (error) {
    throw error
  }
}

export const otpService = { create, verify }
