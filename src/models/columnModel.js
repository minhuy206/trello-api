import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE } from '~/utils/validators'

const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  cardOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    const validatedData = await validateBeforeCreate(data)

    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .insertOne({
        ...validatedData,
        boardId: new ObjectId(validatedData.boardId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (boardId) => {
  try {
    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(boardId) })
  } catch (error) {
    throw new Error(error)
  }
}

const pushCardOrderIds = async (card) => {
  try {
    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(card.columnId) },
        { $push: { cardOrderIds: new ObjectId(card._id) } },
        { ReturnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds
}
