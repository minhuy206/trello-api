import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const create = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json(await columnService.create(req.body))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await columnService.update(req.params.id, req.body))
  } catch (error) {
    next(error)
  }
}

const deleteColumn = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await columnService.deleteColumn(req.params.id))
  } catch (error) {
    next(error)
  }
}

export const columnController = {
  create,
  update,
  deleteColumn
}
