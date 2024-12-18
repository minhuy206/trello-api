import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(1).max(50).trim().strict(),
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE)
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

export const cardValidation = {
  createNew
}
