import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { validateBody } from '~/utils/formatter'
import {
  CreateCardBodySchema,
  DeleteCardParamsSchema,
  GetCardParamsSchema,
  UpdateCardBodySchema,
  UpdateCardParamsSchema
} from './card.model'

const getCard = async (req, res, next) => {
  try {
    await validateBody(GetCardParamsSchema, req.params)
    next()
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    await validateBody(CreateCardBodySchema, req.body)
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
      validateBody(UpdateCardBodySchema, req.body),
      validateBody(UpdateCardParamsSchema, req.params)
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

export const deleteCard = async (req, res, next) => {
  try {
    await validateBody(DeleteCardParamsSchema, req.params)
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

export const cardValidation = {
  getCard,
  create,
  update,
  deleteCard
}
