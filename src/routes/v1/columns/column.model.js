import Joi from 'joi'
import { OBJECT_ID_RULE } from '~/utils/validators'

export const ColumnSchema = Joi.object({
  boardId: Joi.string().required(),
  title: Joi.string().required().min(1).max(50).trim().strict(),
  cardOrderIds: Joi.array().items(Joi.string()).default([]),
  createdById: Joi.string().pattern(OBJECT_ID_RULE).required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const CreateColumnBodySchema = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  title: Joi.string().required().max(63).trim().strict().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.max': 'Title must be at most 63 characters',
    'string.trim': 'Title must not have leading or trailing whitespace'
  })
})

export const UpdateColumnBodySchema = Joi.object({
  title: Joi.string().max(63).trim().strict().messages({
    'string.empty': 'Title is not allowed to be empty',
    'string.max': 'Title must be at most 63 characters',
    'string.trim': 'Title must not have leading or trailing'
  }),
  cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE))
})

export const GetColumnParamsSchema = Joi.object({
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).trim()
})

export const UpdateColumnParamsSchema = GetColumnParamsSchema

export const DeleteColumnParamsSchema = GetColumnParamsSchema
