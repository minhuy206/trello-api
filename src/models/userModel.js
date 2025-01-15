import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  USERNAME_RULE,
  USERNAME_RULE_MESSAGE
} from '~/utils/validators'

const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client'
}

const USERS_COLLECTION_NAME = 'users'
const USERS_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string()
    .required()
    .pattern(USERNAME_RULE)
    .message(USERNAME_RULE_MESSAGE),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string()
    .valid(USER_ROLES.ADMIN, USER_ROLES.CLIENT)
    .default(USER_ROLES.CLIENT),

  isActive: Joi.boolean().default(false),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await USERS_COLLECTION_SCHEMA.validateAsync(data)
}

const create = async (account) => {
  try {
    const validatedAccount = await validateBeforeCreate(account)

    return await GET_DB()
      .collection(USERS_COLLECTION_NAME)
      .insertOne(validatedAccount)
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, account) => {
  try {
    Object.keys(account).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete account[key]
      }
    })

    Object.keys(account).forEach((key) => {
      if (!account[key]) {
        delete account[key]
      }
    })

    return await GET_DB()
      .collection(USERS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: account },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const find = async (field, value) => {
  try {
    return await GET_DB()
      .collection(USERS_COLLECTION_NAME)
      .findOne({ [field]: field === '_id' ? new ObjectId(value) : value })
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USERS_COLLECTION_NAME,
  USERS_COLLECTION_SCHEMA,
  create,
  update,
  find
}
