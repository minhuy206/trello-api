import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE } from '~/utils/validators'

const COMMENTS_COLLECTION_NAME = 'comments'
const COMMENTS_COLLECTION_SCHEMA = Joi.object({
  cardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE),
  userId: Joi.string().required().pattern(OBJECT_ID_RULE),
  content: Joi.string().required().min(1).max(500).trim().strict(),
  commentedAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (comment) => {
  return await COMMENTS_COLLECTION_SCHEMA.validateAsync(comment)
}

const create = async (comment) => {
  try {
    const validatedComment = await validateBeforeCreate(comment)

    return await GET_DB()
      .collection(COMMENTS_COLLECTION_NAME)
      .insertOne({
        ...validatedComment,
        cardId: new ObjectId(validatedComment.cardId),
        columnId: new ObjectId(validatedComment.columnId),
        userId: new ObjectId(validatedComment.userId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (commentId, comment) => {
  try {
    return await GET_DB()
      .collection(COMMENTS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(commentId) },
        { $set: comment },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const find = async (commentId) => {
  try {
    return await GET_DB()
      .collection(COMMENTS_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(commentId) })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteComment = async (commentId) => {
  try {
    return await GET_DB()
      .collection(COMMENTS_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(commentId) })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteComments = async (field, fieldId) => {
  try {
    return await GET_DB()
      .collection(COMMENTS_COLLECTION_NAME)
      .deleteMany({ [field]: new ObjectId(fieldId) })
  } catch (error) {
    throw new Error(error)
  }
}

export const commentModel = {
  COMMENTS_COLLECTION_NAME,
  create,
  update,
  deleteComments,
  deleteComment,
  find
}
