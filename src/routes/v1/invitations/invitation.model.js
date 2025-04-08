import Joi from 'joi'
import { INVITATION_STATUS } from '~/utils/constants'
import { EMAIL_RULE, OBJECT_ID_RULE } from '~/utils/validators'

export const InvitationSchema = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE),
  status: Joi.string()
    .valid(...Object.values(INVITATION_STATUS))
    .default(INVITATION_STATUS.PENDING),
  createdById: Joi.string().required().pattern(OBJECT_ID_RULE),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

export const CreateInvitationBodySchema = Joi.object({
  inviteeEmail: Joi.string().required().pattern(EMAIL_RULE),
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE)
})

export const UpdateInvitationBodySchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(INVITATION_STATUS))
    .default(INVITATION_STATUS.PENDING)
})
export const UpdateInvitationParamsSchema = Joi.object({
  invitationId: Joi.string().required().pattern(OBJECT_ID_RULE)
})
export const DeleteInvitationParamsSchema = UpdateInvitationParamsSchema
