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
  createdAt: Joi.date().timestamp('javascript').default(new Date()),
  expireAt: Joi.date()
    .timestamp('javascript')
    .default(new Date(Date.now() + 300 * 1000))
})

const validateBeforeCreate = async (data) => {
  return await OTPS_COLLECTION_SCHECMA.validateAsync(data)
}

const createOrUpdate = async (body) => {
  try {
    const validatedOtp = await validateBeforeCreate(body)
    return await GET_DB()
      .collection(OTPS_COLLECTION_NAME)
      .updateOne(
        { email: body.email },
        { $set: validatedOtp },
        { upsert: true }
      )
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
    return await GET_DB().collection(OTPS_COLLECTION_NAME).deleteO({ email })
  } catch (error) {
    throw error
  }
}

export const otpModel = {
  OTPS_COLLECTION_NAME,
  OTPS_COLLECTION_SCHECMA,
  createOrUpdate,
  find,
  deleteOtps
}
