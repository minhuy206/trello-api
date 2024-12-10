import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must be at most 50 characters',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string()
      .required()
      .min(3)
      .max(255)
      .trim()
      .strict()
      .messages({
        'any.required': 'Description is required',
        'string.empty': 'Description is not allowed to be empty',
        'string.min': 'Description must be at least 3 characters',
        'string.max': 'Description must be at most 255 characters',
        'string.trim':
          'Description must not have leading or trailing whitespace'
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

export const boardValidation = {
  createNew
}
