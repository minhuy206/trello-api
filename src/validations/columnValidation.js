import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { OBJECT_ID_RULE } from '~/utils/validators'

const create = async (req, res, next) => {
  const schema = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
    title: Joi.string().required().max(63).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.max': 'Title must be at most 63 characters',
      'string.trim': 'Title must not have leading or trailing whitespace'
    })
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

const update = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(63).trim().strict().messages({
      'string.empty': 'Title is not allowed to be empty',
      'string.max': 'Title must be at most 63 characters',
      'string.trim': 'Title must not have leading or trailing'
    }),
    column: Joi.object({
      cardOrderIds: Joi.array()
        .items(Joi.string().pattern(OBJECT_ID_RULE))
        .required()
    }).required()
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

export const deleteColumn = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE)
  }).required()

  try {
    await schema.validateAsync(req.params)
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
  update,
  deleteColumn
}
