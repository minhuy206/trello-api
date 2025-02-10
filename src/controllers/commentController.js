import { StatusCodes } from 'http-status-codes'
import { commentService } from '~/services/commentService'

const create = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json(await commentService.create(req.body))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await commentService.update(req.params.id, req.body))
  } catch (error) {
    next(error)
  }
}

export const commentController = {
  create,
  update
}
