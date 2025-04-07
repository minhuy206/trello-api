import { ObjectId } from 'mongodb'
import { env } from '~/config/environment'
import { GET_DB } from '~/config/mongodb'
import { objectPropertiesStringId2ObjectId } from '~/utils/formatter'

const getCardIncludeComments = async (userId, cardId) => {
  try {
    const result = await GET_DB()
      .collection(env.MONGODB_CARDS_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: [
              { _id: new ObjectId(cardId) },
              { _destroy: false },
              { createdById: new ObjectId(userId) }
            ]
          }
        },
        {
          $lookup: {
            from: env.MONGODB_COMMENTS_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'cardId',
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: env.MONGODB_USERS_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { password: 0, isVerified: 0 } }]
          }
        }
      ])
      .toArray()
    return result[0]
  } catch (error) {
    throw new Error(error)
  }
}

const create = (body) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_CARDS_COLLECTION_NAME)
      .insertOne(objectPropertiesStringId2ObjectId(body))
  } catch (error) {
    throw new Error(error)
  }
}

const update = (cardId, card) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_CARDS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
        { $set: objectPropertiesStringId2ObjectId(card) },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const updateCommentOrderIds = (comment, operator) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_CARDS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(comment.cardId) },
        {
          [operator]: {
            commentIds:
              operator === '$push'
                ? { $each: [new ObjectId(comment._id)], $position: 0 }
                : new ObjectId(comment._id)
          }
        },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const deleteCards = (columnId) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_CARDS_COLLECTION_NAME)

      .deleteMany({ columnId: new ObjectId(columnId) })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteCard = (cardId) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_CARDS_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(cardId) })
  } catch (error) {
    throw new Error(error)
  }
}

const find = (filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_CARDS_COLLECTION_NAME)
      .findOne(objectPropertiesStringId2ObjectId(filter))
  } catch (error) {
    throw new Error(error)
  }
}

export const cardRepository = {
  getCardIncludeComments,
  create,
  update,
  updateCommentOrderIds,
  deleteCards,
  deleteCard,
  find
}
