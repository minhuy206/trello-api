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

const update = (cardId, body) => {
  try {
    if (body.memberIds) {
      body.memberIds = body.memberIds.map((id) => new ObjectId(id))
    }
    if (body.commentOrderIds) {
      body.commentOrderIds = body.commentOrderIds.map((id) => new ObjectId(id))
    }

    return GET_DB()
      .collection(env.MONGODB_CARDS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
        { $set: objectPropertiesStringId2ObjectId(body) },
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
            commentOrderIds:
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
