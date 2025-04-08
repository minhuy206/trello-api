import Joi from 'joi'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE } from '~/utils/validators'

export const BoardSchema = Joi.object({
  title: Joi.string().required().max(63).trim(),
  description: Joi.string().required().max(255).trim(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE))
    .default([]),
  createdById: Joi.string().required().pattern(OBJECT_ID_RULE),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const CreateBoardBodySchema = Joi.object({
  title: Joi.string().required().max(63).trim(),
  description: Joi.string().required().max(255).trim(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
})

export const UpdateBoardBodySchema = Joi.object({
  title: Joi.string().max(63).trim(),
  description: Joi.string().max(255).trim(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE))
})

export const GetBoardParamsSchema = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).trim()
})

export const UpdateBoardParamsSchema = GetBoardParamsSchema
