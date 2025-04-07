import { StatusCodes } from 'http-status-codes'
import { commentService } from './comment.service'

const create = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.CREATED)
      .json(await commentService.create(req.jwtDecoded.id, req.body))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.CREATED)
      .json(
        await commentService.update(
          req.params.commentId,
          req.body,
          req.jwtDecoded.id
        )
      )
  } catch (error) {
    next(error)
  }
}

const deleteComment = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(
        await commentService.deleteComment(
          req.params.commentId,
          req.jwtDecoded.id
        )
      )
  } catch (error) {
    next(error)
  }
}

export const commentController = {
  create,
  update,
  deleteComment
}
