import { GET_DB } from '~/config/mongodb'

const Joi = require('joi')
const { EMAIL_RULE, EMAIL_RULE_MESSAGE } = require('~/utils/validators')

const PASSWORD_RESETS_COLLECTION_NAME = 'password_resets'
const PASSWORD_RESETS_COLLECTION_SCHEMA = Joi.object({
  token: Joi.string().required(),
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
  return await PASSWORD_RESETS_COLLECTION_SCHEMA.validateAsync(data)
}

const createOrUpdate = async (token, email) => {
  try {
    const validatedPasswordReset = await validateBeforeCreate({
      token,
      email
    })

    return await GET_DB()
      .collection(PASSWORD_RESETS_COLLECTION_NAME)
      .updateOne({ email }, { $set: validatedPasswordReset }, { upsert: true })
  } catch (error) {
    throw error
  }
}

const find = async (email) => {
  try {
    return await GET_DB()
      .collection(PASSWORD_RESETS_COLLECTION_NAME)
      .find({ email })
      .toArray()
  } catch (error) {
    throw error
  }
}

const deletePasswordResets = async (email) => {
  try {
    return await GET_DB()
      .collection(PASSWORD_RESETS_COLLECTION_NAME)
      .deleteMany({ email })
  } catch (error) {
    throw error
  }
}

export const passwordResetModel = {
  PASSWORD_RESETS_COLLECTION_NAME,
  PASSWORD_RESETS_COLLECTION_SCHEMA,
  createOrUpdate,
  find,
  deletePasswordResets
}
