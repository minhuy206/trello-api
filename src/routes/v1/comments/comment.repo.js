import { env } from '~/config/environment'
import { GET_DB } from '~/config/mongodb'
import { objectPropertiesStringId2ObjectId } from '~/utils/formatter'

const create = (body) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .insertOne(objectPropertiesStringId2ObjectId(body))
  } catch (error) {
    throw new Error(error)
  }
}

const update = (filter, body) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .findOneAndUpdate(
        objectPropertiesStringId2ObjectId(filter),
        { $set: objectPropertiesStringId2ObjectId(body) },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const updateComments = (filter, update) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .updateMany(objectPropertiesStringId2ObjectId(filter), {
        $set: objectPropertiesStringId2ObjectId(update)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const find = (filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .findOne(objectPropertiesStringId2ObjectId(filter))
  } catch (error) {
    throw new Error(error)
  }
}

const deleteComment = (filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .deleteOne(objectPropertiesStringId2ObjectId(filter))
  } catch (error) {
    throw new Error(error)
  }
}

const deleteComments = (filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .deleteMany(objectPropertiesStringId2ObjectId(filter))
  } catch (error) {
    throw new Error(error)
  }
}

export const commentRepository = {
  create,
  update,
  updateComments,
  deleteComments,
  deleteComment,
  find
}
