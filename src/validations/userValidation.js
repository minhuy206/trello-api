import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import {
  USERNAME_RULE,
  USERNAME_RULE_MESSAGE,
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators'

const create = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string()
      .required()
      .pattern(USERNAME_RULE)
      .message(USERNAME_RULE_MESSAGE),
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE)
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    next()
    new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
  }
}

const login = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE)
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    next()
    new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
  }
}

const verify = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    next()
    new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
  }
}

export const userValidation = {
  create,
  login,
  verify
}
