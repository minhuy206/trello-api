import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE } from '~/utils/validators'

const create = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(1).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must be at most 50 characters',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string()
      .required()
      .min(1)
      .max(255)
      .trim()
      .strict()
      .messages({
        'any.required': 'Description is required',
        'string.empty': 'Description is not allowed to be empty',
        'string.min': 'Description must be at least 1 character',
        'string.max': 'Description must be at most 255 characters',
        'string.trim':
          'Description must not have leading or trailing whitespace'
      }),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
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
    title: Joi.string().min(1).max(50).trim().strict(),
    description: Joi.string().min(1).max(255).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE))
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

export const boardValidation = {
  create,
  update
}
