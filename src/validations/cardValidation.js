import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { OBJECT_ID_RULE } from '~/utils/validators'

const create = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(63).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.max': 'Title must be at most 63 characters',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE)
  })

  try {
    await schema.validateAsync(req.body)
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
  const schema = Joi.object({
    title: Joi.string().max(50).trim().strict().messages({
      'string.empty': 'Title is not allowed to be empty',
      'string.max': 'Title must be at most 50 characters',
      'string.trim': 'Title must not have leading or trailing'
    }),
    columnId: Joi.string().pattern(OBJECT_ID_RULE)
  }).required()

  try {
    await schema.validateAsync(req.body)

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
  create,
  update
}
