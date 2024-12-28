import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'

const create = async (req, res, next) => {
  const schema = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
    title: Joi.string().required().min(1).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must be at most 50 characters',
      'string.trim': 'Title must not have leading or trailing whitespace'
    })
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

const update = async (req, res, next) => {
  const schema = Joi.object({
    column: Joi.object({
      cardOrderIds: Joi.array()
        .items(Joi.string().pattern(OBJECT_ID_RULE))
        .required()
    }),
    cardId: Joi.string().required().pattern(OBJECT_ID_RULE)
  })

  try {
    await schema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })

    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

export const deleteColumn = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE)
  })

  try {
    await schema.validateAsync(req.params)
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

export const columnValidation = {
  create,
  update,
  deleteColumn
}
