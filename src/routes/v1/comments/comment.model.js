import Joi from 'joi'
import { OBJECT_ID_RULE } from '~/utils/validators'

export const CommentSchema = Joi.object({
  content: Joi.string().required().max(1023).trim().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content is not allowed to be empty',
    'string.max': 'Content must be at most 1023 characters',
    'string.trim': 'Content must not have leading or trailing whitespace'
  }),
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE),
  cardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  createdById: Joi.string().required().pattern(OBJECT_ID_RULE),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

export const CreateCommentBodySchema = Joi.object({
  content: Joi.string().required().max(1023).trim().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content is not allowed to be empty',
    'string.max': 'Content must be at most 1023 characters',
    'string.trim': 'Content must not have leading or trailing whitespace'
  }),
  cardId: Joi.string().required().pattern(OBJECT_ID_RULE)
})

export const UpdateCommentBodySchema = Joi.object({
  content: Joi.string().max(1023).trim().messages({
    'string.empty': 'Content is not allowed to be empty',
    'string.max': 'Content must be at most 1023 characters',
    'string.trim': 'Content must not have leading or trailing whitespace'
  }),
  columnId: Joi.string().pattern(OBJECT_ID_RULE)
})

export const UpdateCommentParamsSchema = Joi.object({
  commentId: Joi.string().required().pattern(OBJECT_ID_RULE)
})

export const DeleteCommentParamsSchema = UpdateCommentParamsSchema
