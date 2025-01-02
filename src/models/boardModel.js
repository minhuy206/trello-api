import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { paginationSkipValue } from '~/utils/algorithms'

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(1).trim().strict(),
  description: Joi.string().required().min(1).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),
  ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE)).default([]),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const create = async (userId, board) => {
  try {
    const validatedBoard = await validateBeforeCreate(board)

    return await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne({ ...validatedBoard, ownerIds: [new ObjectId(userId)] })
  } catch (error) {
    throw new Error(error)
  }
}

const getBoard = async (userId, boardId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
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
                  { ownerIds: { $all: [new ObjectId(userId)] } },
                  { memberIds: { $all: [new ObjectId(userId)] } }
                ]
              }
            ]
          }
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        }
      ])
      .toArray()

    return result[0]
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const res = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          {
            $match: {
              $and: [
                { _destroy: false },
                {
                  $or: [
                    { ownerIds: { $all: [new ObjectId(userId)] } },
                    { memberIds: { $all: [new ObjectId(userId)] } }
                  ]
                }
              ]
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

const update = async (boardId, board) => {
  try {
    Object.keys(board).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete board[key]
      }
    })

    if (board.columnOrderIds)
      board.columnOrderIds = board.columnOrderIds.map((id) => new ObjectId(id))

    return await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $set: board },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const updateColumnOrderIds = async (column, operator) => {
  try {
    return await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { [operator]: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const find = async (boardId) => {
  try {
    return await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(boardId) })
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  create,
  getBoards,
  getBoard,
  update,
  updateColumnOrderIds,
  find
}
