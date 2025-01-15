import { GET_DB } from '~/config/mongodb'

const Joi = require('joi')
const { EMAIL_RULE, EMAIL_RULE_MESSAGE } = require('~/utils/validators')

const OTPS_COLLECTION_NAME = 'otps'
const OTPS_COLLECTION_SCHECMA = Joi.object({
  hashOtp: Joi.string().required(),
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  createAt: Joi.date().timestamp('javascript').default(new Date()),
  expiresAfter: Joi.date()
    .timestamp('javascript')
    .default(new Date(Date.now() + 300 * 1000))
})

const validateBeforeCreate = async (data) => {
  return await OTPS_COLLECTION_SCHECMA.validateAsync(data)
}

const create = async (hashOtp, email) => {
  try {
    const validatedOtp = await validateBeforeCreate({ hashOtp, email })

    return await GET_DB()
      .collection(OTPS_COLLECTION_NAME)
      .insertOne(validatedOtp)
  } catch (error) {
    throw error
  }
}

const find = async (email) => {
  try {
    return await GET_DB()
      .collection(OTPS_COLLECTION_NAME)
      .find({ email })
      .toArray()
  } catch (error) {
    throw error
  }
}

const deleteOtps = async (email) => {
  try {
    return await GET_DB().collection(OTPS_COLLECTION_NAME).deleteMany({ email })
  } catch (error) {
    throw error
  }
}

export const otpModel = {
  OTPS_COLLECTION_NAME,
  OTPS_COLLECTION_SCHECMA,
  create,
  find,
  deleteOtps
}
