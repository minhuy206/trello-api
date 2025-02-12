import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'

const create = async (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().required().min(1).max(50).trim().strict().messages({
      'any.required': 'Content is required',
      'string.empty': 'Content is not allowed to be empty',
      'string.min': 'Content must be at least 1 character',
      'string.max': 'Content must be at most 50 characters',
      'string.trim': 'Content must not have leading or trailing whitespace'
    }),
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE),
    cardId: Joi.string().required().pattern(OBJECT_ID_RULE),
    userId: Joi.string().required().pattern(OBJECT_ID_RULE)
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

const update = async (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(1).max(50).trim().strict().messages({
      'string.empty': 'Content is not allowed to be empty',
      'string.min': 'Content must be at least 1 character',
      'string.max': 'Content must be at most 50 characters',
      'string.trim': 'Content must not have leading or trailing'
    })
  })

  try {
    await schema.validateAsync(req.body, {
      allowUnknown: true
    })

    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

export const commentValidation = {
  create,
  update
}
