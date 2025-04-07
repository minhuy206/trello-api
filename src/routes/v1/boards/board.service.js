import CustomAPIError from '~/utils/CustomAPIError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
import { boardRepository } from './board.repo'
import { validateBody } from '~/utils/formatter'
import { BoardSchema } from './board.model'

const create = async (userId, body) => {
  try {
    return boardRepository.find({
      _id: (
        await boardRepository.create({
          ...(await validateBody(BoardSchema, { ...body, createdById: userId }))
        })
      ).insertedId
    })
  } catch (error) {
    throw error
  }
}

const getBoards = (
  userId,
  { page = DEFAULT_PAGE, itemsPerPge = DEFAULT_ITEMS_PER_PAGE, q }
) => {
  try {
    return boardRepository.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPge, 10),
      q
    )
  } catch (error) {
    throw error
  }
}

const getBoard = async (userId, boardId) => {
  try {
    const board = await boardRepository.getBoard(userId, boardId)

    if (!board) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Board not found'
      )
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

const update = async (boardId, body) => {
  try {
    const targetBoard = await boardRepository.find({ _id: boardId })
    if (!targetBoard) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    return boardRepository.update(boardId, {
      ...body,
      updatedAt: Date.now()
    })
  } catch (error) {
    throw error
  }
}

export const boardService = {
  create,
  getBoards,
  getBoard,
  update
}
