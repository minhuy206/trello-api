import bcryptjs from 'bcryptjs'
import { otpModel } from '~/models/otpModel'

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
      return false
    }

    const result = bcryptjs.compareSync(OTP, otps[otps.length - 1].hashOtp)

    if (result) {
      await otpModel.deleteOtps(email)
      return true
    }
  } catch (error) {
    throw error
  }
}

export const otpService = { create, verify }
