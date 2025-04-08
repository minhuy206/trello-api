import { StatusCodes } from 'http-status-codes'
import { boardService } from './board.service'

const create = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.CREATED)
      .json(await boardService.create(req.jwtDecoded.id, req.body))
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await boardService.getBoards(req.jwtDecoded.id, req.query))
  } catch (error) {
    next(error)
  }
}

const getBoard = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await boardService.getBoard(req.jwtDecoded.id, req.params.boardId))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.CREATED)
      .json(await boardService.update(req.params.boardId, req.body))
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  create,
  getBoards,
  getBoard,
  update
}
