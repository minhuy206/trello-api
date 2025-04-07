import Joi from 'joi'
import { OBJECT_ID_RULE } from '~/utils/validators'

export const CardSchema = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE),
  title: Joi.string().required().max(63).trim().strict().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.max': 'Title must be at most 63 characters',
    'string.trim': 'Title must not have leading or trailing whitespace'
  }),
  description: Joi.string().optional(),
  cover: Joi.string().default(null),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),
  commentOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),
  createdById: Joi.string().required().pattern(OBJECT_ID_RULE),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const CreateCardBodySchema = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE),
  title: Joi.string().required().max(63).trim().strict().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.max': 'Title must be at most 63 characters',
    'string.trim': 'Title must not have leading or trailing whitespace'
  }),
  description: Joi.string().required()
})

export const UpdateCardBodySchema = Joi.object({
  title: Joi.string().required().max(63).trim().strict().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.max': 'Title must be at most 63 characters',
    'string.trim': 'Title must not have leading or trailing whitespace'
  }),
  description: Joi.string().optional(),
  cover: Joi.string().default(null),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE),
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE)).default([])
})
export const GetCardParamsSchema = Joi.object({
  cardId: Joi.string().required().pattern(OBJECT_ID_RULE)
})

export const UpdateCardParamsSchema = GetCardParamsSchema

export const DeleteCardParamsSchema = GetCardParamsSchema
