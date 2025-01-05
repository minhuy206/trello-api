import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE } from '~/utils/validators'

const createBoardInvitation = async (req, res, next) => {
  const schema = Joi.object({
    inviteeEmail: Joi.string().pattern(EMAIL_RULE).required()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

export const invitationValidation = {
  createBoardInvitation
}
