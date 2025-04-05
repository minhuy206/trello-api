import { StatusCodes } from 'http-status-codes'
import { columnService } from './column.service'

const create = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.CREATED)
      .json(await columnService.create(req.jwtDecoded.id, req.body))
  } catch (error) {
    next(error)
  }
}

const getColumn = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(
        await columnService.getColumn(req.jwtDecoded.id, req.params.columnId)
      )
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.CREATED)
      .json(
        await columnService.update(
          req.params.columnId,
          req.body,
          req.jwtDecoded.id
        )
      )
  } catch (error) {
    next(error)
  }
}

const deleteColumn = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(
        await columnService.deleteColumn(req.params.columnId, req.jwtDecoded.id)
      )
  } catch (error) {
    next(error)
  }
}

export const columnController = {
  create,
  update,
  getColumn,
  deleteColumn
}
