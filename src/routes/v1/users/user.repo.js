import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { validateBody } from '~/utils/formatter'
import { UserSchema } from './user.model'
import { env } from '~/config/environment'
import { objectPropertiesStringId2ObjectId } from '~/utils/formatter'

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

const findUser = (filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_USERS_COLLECTION_NAME)
      .findOne(objectPropertiesStringId2ObjectId(filter))
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
        { $set: validatedBody },
        { upsert: true }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const find = ({ collectionName, filter }) => {
  try {
    return GET_DB()
      .collection(collectionName)
      .findOne(objectPropertiesStringId2ObjectId(filter))
  } catch (error) {
    throw error
  }
}

const erase = ({ collectionName, filter }) => {
  try {
    return GET_DB()
      .collection(collectionName)
      .deleteOne(objectPropertiesStringId2ObjectId(filter))
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
