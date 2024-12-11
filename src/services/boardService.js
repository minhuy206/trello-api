/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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

    return board
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getBoard
}
