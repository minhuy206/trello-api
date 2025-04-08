import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { validateBody } from '~/utils/formatter'
import {
  CreateInvitationBodySchema,
  UpdateInvitationBodySchema,
  UpdateInvitationParamsSchema
} from './invitation.model'

const createInvitation = async (req, res, next) => {
  try {
    await validateBody(CreateInvitationBodySchema, req.body)
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

const updateInvitation = async (req, res, next) => {
  try {
    await Promise.all([
      validateBody(UpdateInvitationParamsSchema, req.params),
      validateBody(UpdateInvitationBodySchema, req.body)
    ])
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

export const invitationValidation = {
  createInvitation,
  updateInvitation
}
