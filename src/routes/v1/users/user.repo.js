import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { validateBody } from '~/utils/helper'
import { UserSchema } from './user.model'
import { env } from '~/config/environment'

// const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

const createUser = async (body) => {
  try {
    const validatedBody = await validateBody(UserSchema, body)
    return GET_DB()
      .collection(env.MONGODB_USERS_COLLECTION_NAME)
      .insertOne(validatedBody)
  } catch (error) {
    throw new Error(error)
  }
}

const updateUser = (userId, account) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_USERS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: account },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const findUser = (field, value) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_USERS_COLLECTION_NAME)
      .findOne({ [field]: field === '_id' ? new ObjectId(value) : value })
  } catch (error) {
    throw new Error(error)
  }
}

const findUserByEmailOrUsername = (email, username) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_USERS_COLLECTION_NAME)
      .findOne({
        $or: [{ email }, { username }]
      })
  } catch (error) {
    throw new Error(error)
  }
}

const upsert = async ({ collectionName, schema, body }) => {
  try {
    const validatedBody = await validateBody(schema, body)
    return GET_DB()
      .collection(collectionName)
      .updateOne(
        { email: body.email },
        { $set: { validatedBody } },
        { upsert: true }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const find = async ({ collectionName, email }) => {
  try {
    return await GET_DB()
      .collection(collectionName)
      .findOne({ email })
      .toArray()
  } catch (error) {
    throw error
  }
}

const erase = async (collectionName, email) => {
  try {
    return await GET_DB().collection(collectionName).deleteOne({ email })
  } catch (error) {
    throw error
  }
}

export const userRepository = {
  createUser,
  updateUser,
  findUser,
  findUserByEmailOrUsername,
  upsert,
  find,
  erase
}
