import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE } from '~/utils/validators'

const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  title: Joi.string().required().min(1).max(50).trim().strict(),

  cardOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (column) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(column, {
    abortEarly: false
  })
}

const create = async (column) => {
  try {
    const validatedColumn = await validateBeforeCreate(column)

    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .insertOne({
        ...validatedColumn,
        boardId: new ObjectId(validatedColumn.boardId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (columnId, column) => {
  try {
    Object.keys(column).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete column[key]
      }
    })

    if (column.cardOrderIds)
      column.cardOrderIds = column.cardOrderIds.map((id) => new ObjectId(id))

    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(columnId) },
        { $set: column },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const deleteColumn = async (columnId) => {
  try {
    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .deleteOne({
        _id: new ObjectId(columnId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const find = async (columnId) => {
  try {
    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(columnId) })
  } catch (error) {
    throw new Error(error)
  }
}

const updateCardOrderIds = async (card, operator) => {
  try {
    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(card.columnId) },
        { [operator]: { cardOrderIds: new ObjectId(card._id) } },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  create,
  update,
  updateCardOrderIds,
  deleteColumn,
  find
}
