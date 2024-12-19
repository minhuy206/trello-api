import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const create = async (req, res, next) => {
  try {
    const createdColumn = await columnService.create(req.body)

    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id

    const column = await columnService.update(columnId, req.body)

    return res.status(StatusCodes.OK).json(column)
  } catch (error) {
    next(error)
  }
}

const deleteColumn = async (req, res, next) => {
  try {
    const columnId = req.params.id

    return res
      .status(StatusCodes.OK)
      .json(await columnService.deleteColumn(columnId))
  } catch (error) {
    next(error)
  }
}

export const columnController = {
  create,
  update,
  deleteColumn
}
