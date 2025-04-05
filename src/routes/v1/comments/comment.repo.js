import { ObjectId } from 'mongodb'
import { env } from '~/config/environment'
import { GET_DB } from '~/config/mongodb'
import { objectPropertiesStringId2ObjectId } from '~/utils/formatter'

const create = (body) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .insertOne({
        ...objectPropertiesStringId2ObjectId(body)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const update = (commentId, comment) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(commentId) },
        { $set: comment },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const find = (commentId) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(commentId) })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteComment = (commentId) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(commentId) })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteComments = (field, fieldId) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COMMENTS_COLLECTION_NAME)
      .deleteMany({ [field]: new ObjectId(fieldId) })
  } catch (error) {
    throw new Error(error)
  }
}

export const commentRepository = {
  create,
  update,
  deleteComments,
  deleteComment,
  find
}
