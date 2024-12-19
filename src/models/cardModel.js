import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE } from '~/utils/validators'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE),
  title: Joi.string().required().min(1).max(50).trim().strict(),
  description: Joi.string().optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (card) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(card, {
    abortEarly: true
  })
}

const create = async (card) => {
  try {
    const validatedCard = await validateBeforeCreate(card)

    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
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

    if (card.columnId) {
      card.columnId = new ObjectId(card.columnId)
    }

    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
        { $set: card },
        { ReturnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const deleteCards = async (columnId) => {
  try {
    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({ columnId: new ObjectId(columnId) })
  } catch (error) {
    throw new Error(error)
  }
}

const find = async (boardId) => {
  try {
    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(boardId) })
  } catch (error) {
    throw new Error(error)
  }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  create,
  update,
  deleteCards,
  find
}
