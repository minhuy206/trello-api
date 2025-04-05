import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { otpModel } from '~/models/otpModel'
import CustomAPIError from '~/utils/CustomAPIError'

const create = async ({ OTP, email }) => {
  try {
    const hashOtp = bcryptjs.hashSync(OTP, 8)

    return (await otpModel.createOrUpdate({ hashOtp, email })) ? 1 : 0
  } catch (error) {
    throw error
  }
}

const verify = async ({ OTP, email }) => {
  try {
    const otps = await otpModel.find(email)

    if (otps) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'OTP not found')
    }

    if (!bcryptjs.compareSync(OTP, otps[otps.length - 1].hashOtp)) {
      throw new CustomAPIError(StatusCodes.NOT_ACCEPTABLE, 'Invalid OTP')
    }
    await otpModel.deleteOtps(email)
    return true
  } catch (error) {
    throw error
  }
}

export const otpService = { create, verify }
