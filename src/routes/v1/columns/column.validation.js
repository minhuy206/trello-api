import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { validateBody } from '~/utils/helper'
import {
  CreateColumnBodySchema,
  DeleteColumnParamsSchema,
  GetColumnParamsSchema,
  UpdateColumnBodySchema,
  UpdateColumnParamsSchema
} from './column.model'

const create = async (req, res, next) => {
  try {
    await validateBody(CreateColumnBodySchema, req.body)
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

const getColumn = async (req, res, next) => {
  try {
    await validateBody(GetColumnParamsSchema, req.params)
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
      validateBody(UpdateColumnBodySchema, req.body),
      validateBody(UpdateColumnParamsSchema, req.params)
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

export const deleteColumn = async (req, res, next) => {
  try {
    await validateBody(DeleteColumnParamsSchema, req.params)
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

export const columnValidation = {
  create,
  getColumn,
  update,
  deleteColumn
}
