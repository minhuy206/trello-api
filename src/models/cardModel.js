import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { commentModel } from './commentModel'
import { userModel } from './userModel'

const CARDS_COLLECTION_NAME = 'cards'
const CARDS_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE),
  title: Joi.string().required().min(1).max(50).trim().strict(),
  description: Joi.string().optional(),
  cover: Joi.string().default(null),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),
  commentIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (card) => {
  return await CARDS_COLLECTION_SCHEMA.validateAsync(card)
}

const getCard = async (userId, cardId) => {
  try {
    const result = await GET_DB()
      .collection(CARDS_COLLECTION_NAME)
      .aggregate([
        {
          $match: { $and: [{ _id: new ObjectId(cardId) }, { _destroy: false }] }
        },
        {
          $lookup: {
            from: commentModel.COMMENTS_COLLECTION_NAME,
            localField: 'commentIds',
            foreignField: '_id',
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: userModel.USERS_COLLECTION_NAME,
            localField: 'comments.userId',
            foreignField: '_id',
            as: 'users',
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

const create = async (card) => {
  try {
    const validatedCard = await validateBeforeCreate(card)

    return await GET_DB()
      .collection(CARDS_COLLECTION_NAME)
      .insertOne({
        ...validatedCard,
        boardId: new ObjectId(validatedCard.boardId),
        columnId: new ObjectId(validatedCard.columnId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (cardId, card) => {
  try {
    Object.keys(card).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete card[key]
      }
    })

    if (card.columnId) card.columnId = new ObjectId(card.columnId)

    return await GET_DB()
      .collection(CARDS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
        { $set: card },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const updateCommentIds = async (comment, operator) => {
  try {
    return await GET_DB()
      .collection(CARDS_COLLECTION_NAME)
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

const deleteCards = async (columnId) => {
  try {
    return await GET_DB()
      .collection(CARDS_COLLECTION_NAME)
      .deleteMany({ columnId: new ObjectId(columnId) })
  } catch (error) {
    throw new Error(error)
  }
}

const find = async (cardId) => {
  try {
    return await GET_DB()
      .collection(CARDS_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(cardId) })
  } catch (error) {
    throw new Error(error)
  }
}

export const cardModel = {
  CARDS_COLLECTION_NAME,
  CARDS_COLLECTION_SCHEMA,
  getCard,
  create,
  update,
  updateCommentIds,
  deleteCards,
  find
}
