import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const create = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json(await boardService.create(req.body))
  } catch (error) {
    next(error)
  }
}

const getBoard = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await boardService.getBoard(req.params.id))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await boardService.update(req.params.id, req.body))
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  create,
  update,
  getBoard
}
