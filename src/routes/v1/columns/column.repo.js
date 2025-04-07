import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

import { env } from '~/config/environment'
import { objectPropertiesStringId2ObjectId } from '~/utils/formatter'

const create = (body) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COLUMNS_COLLECTION_NAME)
      .insertOne(objectPropertiesStringId2ObjectId(body))
  } catch (error) {
    throw new Error(error)
  }
}

const getColumnIncludeCards = async (userId, columnId) => {
  try {
    const result = await GET_DB()
      .collection(env.MONGODB_COLUMNS_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: [
              { _id: new ObjectId(columnId) },
              { _destroy: false },
              {
                createdById: new ObjectId(userId)
              }
            ]
          }
        },
        {
          $lookup: {
            from: env.MONGODB_CARDS_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'columnId',
            as: 'cards'
          }
        },
        {
          $lookup: {
            from: env.MONGODB_COMMENTS_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'columnId',
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

const update = (columnId, column) => {
  try {
    if (column.cardOrderIds)
      column.cardOrderIds = column.cardOrderIds.map((id) => new ObjectId(id))

    return GET_DB()
      .collection(env.MONGODB_COLUMNS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(columnId) },
        { $set: column },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const deleteColumn = (columnId) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COLUMNS_COLLECTION_NAME)
      .deleteOne({
        _id: new ObjectId(columnId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const find = (filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COLUMNS_COLLECTION_NAME)
      .findOne(objectPropertiesStringId2ObjectId(filter))
  } catch (error) {
    throw new Error(error)
  }
}

const updateCardOrderIds = (card, operator) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_COLUMNS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(card.columnId) },
        { [operator]: { cardOrderIds: new ObjectId(card._id) } },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

export const columnRepository = {
  create,
  getColumnIncludeCards,
  update,
  updateCardOrderIds,
  deleteColumn,
  find
}
