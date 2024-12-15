import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (data) => {
  try {
    const createdBoard = await boardModel.createNew({
      ...data,
      slug: slugify(data.title)
    })

    return await boardModel.findOneById(createdBoard.insertedId)
  } catch (error) {
    throw error
  }
}

const getBoard = async (boardId) => {
  try {
    const board = await boardModel.getBoard(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    const resBoard = cloneDeep(board)
    resBoard.columns.forEach((column) => {
      column.cards = resBoard.cards.filter(
        (card) => card.columnId.equals(column._id) // Equals is a method supported by Mongodb to compare 2 ObjectId
      )
    })

    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getBoard
}
