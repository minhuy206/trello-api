import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, OBJECT_ID_RULE, USERNAME_RULE } from '~/utils/validators'

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
  comments: Joi.array().items({
    user: Joi.object({
      _id: Joi.string().required().pattern(OBJECT_ID_RULE),
      email: Joi.string().required().pattern(EMAIL_RULE),
      username: Joi.string().required().pattern(USERNAME_RULE),
      displayName: Joi.string().required().trim().strict(),
      avatar: Joi.string().default(null)
    }),
    content: Joi.string(),
    commentAt: Joi.date().timestamp() // Chỗ này lưu ý vì dùng hàm $push để thêm comment nên không set default là Date.now luôn giống hàm insertOne khi create đươc
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (card) => {
  return await CARDS_COLLECTION_SCHEMA.validateAsync(card, {
    abortEarly: true
  })
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

const unShiftComment = async (cardId, comment) => {
  try {
    return await GET_DB()
      .collection(CARDS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
        { $push: { comments: { $each: [comment], $position: 0 } } },
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
  create,
  update,
  unShiftComment,
  deleteCards,
  find
}
