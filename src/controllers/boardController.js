import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    const createdBoard = await boardService.createNew(req.body)

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

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id

    const board = await boardService.update(boardId, req.body)

    return res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getBoard,
  update
}
