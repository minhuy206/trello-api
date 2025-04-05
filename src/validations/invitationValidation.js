import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { EMAIL_RULE } from '~/utils/validators'

const createBoardInvitation = async (req, res, next) => {
  const schema = Joi.object({
    inviteeEmail: Joi.string().pattern(EMAIL_RULE).required()
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

export const invitationValidation = {
  createBoardInvitation
}
