import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { paginationSkipValue } from '~/utils/algorithms'

import { env } from '~/config/environment'
import { objectPropertiesStringId2ObjectId } from '~/utils/formatter'

const create = async (body) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_BOARDS_COLLECTION_NAME)
      .insertOne(objectPropertiesStringId2ObjectId(body))
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage, q) => {
  const conditions = [
    { _destroy: false },
    {
      $or: [
        {
          memberIds: { $all: [new ObjectId(userId)] }
        },
        {
          createdById: new ObjectId(userId)
        }
      ]
    }
  ]
  if (q) {
    Object.keys(q).forEach((key) => {
      conditions.push({ [key]: { $regex: new RegExp(q[key], 'i') } })
    })
  }
  try {
    const res = await GET_DB()
      .collection(env.MONGODB_BOARDS_COLLECTION_NAME)
      .aggregate(
        [
          {
            $match: {
              $and: conditions
            }
          },
          {
            $sort: { title: 1 }
          },
          // facet để xử lý nhiều luồng trong một query
          {
            $facet: {
              // Luồng 1: Query board
              boards: [
                { $skip: paginationSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bảng ghi của những trang page trước đó
                { $limit: itemsPerPage }
              ],

              // Luồng 2: Query đếm tổng tất cả số lượng bản ghi boards trong DB và trả về biến totalBoards
              totalBoards: [{ $count: 'totalBoards' }]
            }
          }
        ],
        // Chỉ định locale để sắp xếp chuỗi theo thứ tự bảng chữ cái tiếng Anh để fix chữ B trước a do sắp xếp theo bảng ASCII
        { collation: { locale: 'en' } }
      )
      .toArray()

    return {
      boards: res[0].boards || [],
      totalBoards: res[0].totalBoards[0]?.totalBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getBoard = async (userId, boardId) => {
  try {
    const result = await GET_DB()
      .collection(env.MONGODB_BOARDS_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: [
              {
                _id: new ObjectId(boardId)
              },
              { _destroy: false },
              {
                $or: [
                  {
                    memberIds: { $all: [new ObjectId(userId)] }
                  },
                  {
                    createdById: new ObjectId(userId)
                  }
                ]
              }
            ]
          }
        },
        {
          $lookup: {
            from: env.MONGODB_COLUMNS_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: env.MONGODB_CARDS_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
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
        },
        {
          $lookup: {
            from: env.MONGODB_USERS_COLLECTION_NAME,
            localField: 'createdById',
            foreignField: '_id',
            as: 'createdBy',
            pipeline: [{ $project: { password: 0, isVerified: 0 } }]
          }
        },
        {
          $unwind: {
            path: '$createdBy',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()

    return result[0]
  } catch (error) {
    throw new Error(error)
  }
}

const update = (boardId, body) => {
  try {
    if (body.columnOrderIds)
      body.columnOrderIds = body.columnOrderIds.map((id) => new ObjectId(id))

    return GET_DB()
      .collection(env.MONGODB_BOARDS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $set: body },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const updateColumnOrderIds = (column, operator) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_BOARDS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { [operator]: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const find = (filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_BOARDS_COLLECTION_NAME)
      .findOne(objectPropertiesStringId2ObjectId(filter))
  } catch (error) {
    throw new Error(error)
  }
}

export const boardRepository = {
  create,
  getBoards,
  getBoard,
  update,
  updateColumnOrderIds,
  find
}
