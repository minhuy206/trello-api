import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng sang service
    const createdBoard = await boardService.createNew(req.body)

    // Có kết quả trả về client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error)
  }
}

const getBoard = async (req, res, next) => {
  try {
    const boardId = req.params.id

    const board = await boardService.getBoard(boardId)

    return res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getBoard
}
