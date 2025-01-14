import { GET_DB } from '~/config/mongodb'

const Joi = require('joi')
const { EMAIL_RULE, EMAIL_RULE_MESSAGE } = require('~/utils/validators')

const OTP_COLLECTION_NAME = 'otp'
const OTP_COLLECTION_SCHECMA = Joi.object({
  hashOtp: Joi.string().required(),
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE)
  // createdAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await OTP_COLLECTION_SCHECMA.validateAsync(data)
}

const create = async (hashOtp, email) => {
  try {
    const validatedOtp = await validateBeforeCreate({ hashOtp, email })

    return await GET_DB()
      .collection(OTP_COLLECTION_NAME)
      .insertOne(validatedOtp)
  } catch (error) {
    throw error
  }
}

const find = async (email) => {
  try {
    return await GET_DB()
      .collection(OTP_COLLECTION_NAME)
      .find({ email })
      .toArray()
  } catch (error) {
    throw error
  }
}

const deleteOtps = async (email) => {
  try {
    return await GET_DB().collection(OTP_COLLECTION_NAME).deleteMany({ email })
  } catch (error) {
    throw error
  }
}

export const otpModel = {
  OTP_COLLECTION_NAME,
  OTP_COLLECTION_SCHECMA,
  create,
  find,
  deleteOtps
}
