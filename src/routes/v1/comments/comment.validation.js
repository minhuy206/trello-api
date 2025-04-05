import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { validateBody } from '~/utils/helper'
import {
  CreateCommentBodySchema,
  DeleteCommentParamsSchema,
  UpdateCommentBodySchema,
  UpdateCommentParamsSchema
} from './comment.model'

const create = async (req, res, next) => {
  try {
    await validateBody(CreateCommentBodySchema, req.body)
    next()
  } catch (error) {
    next(
      new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
      )
    )
  }
}

const update = async (req, res, next) => {
  try {
    await Promise.all([
      validateBody(UpdateCommentBodySchema, req.body),
      validateBody(UpdateCommentParamsSchema, req.params)
    ])
    next()
  } catch (error) {
    next(
      new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
      )
    )
  }
}

export const deleteComment = async (req, res, next) => {
  try {
    await validateBody(DeleteCommentParamsSchema, req.params)
    next()
  } catch (error) {
    next(
      new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
      )
    )
  }
}

export const commentValidation = {
  create,
  update,
  deleteComment
}
