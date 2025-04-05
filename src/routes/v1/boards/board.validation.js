import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { validateBody } from '~/utils/helper'
import {
  CreateBoardBodySchema,
  GetBoardParamsSchema,
  UpdateBoardBodySchema,
  UpdateBoardParamsSchema
} from './board.model'

const create = async (req, res, next) => {
  try {
    await validateBody(CreateBoardBodySchema, req.body)
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

const getBoard = async (req, res, next) => {
  try {
    await validateBody(GetBoardParamsSchema, req.params)
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
      validateBody(UpdateBoardBodySchema, req.body),
      validateBody(UpdateBoardParamsSchema, req.params)
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

export const boardValidation = {
  create,
  getBoard,
  update
}
