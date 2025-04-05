import { StatusCodes } from 'http-status-codes'
import CustomAPIError from '~/utils/CustomAPIError'
import { validateBody } from '~/utils/helper'
import {
  ForgotPasswordBodySchema,
  LoginBodySchema,
  RegisterBodySchema,
  ResetPasswordBodySchema,
  SendOtpBodySchema,
  UpdateBodySchema,
  VerifyBodySchema
} from './user.model'

const register = async (req, res, next) => {
  try {
    await validateBody(RegisterBodySchema, req.body)
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

const verify = async (req, res, next) => {
  try {
    next(await validateBody(VerifyBodySchema, req.body))
  } catch (error) {
    next(
      new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
      )
    )
  }
}

const sendOtp = async (req, res, next) => {
  try {
    await validateBody(SendOtpBodySchema, req.body)
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

const login = async (req, res, next) => {
  try {
    await validateBody(LoginBodySchema, req.body)
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

const forgotPassword = async (req, res, next) => {
  try {
    next(await validateBody(ForgotPasswordBodySchema, req.body))
  } catch (error) {
    next(
      new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
      )
    )
  }
}

const resetPassword = async (req, res, next) => {
  try {
    next(await validateBody(ResetPasswordBodySchema, req.body))
  } catch (error) {
    next(
      new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
      )
    )
  }
}

const updateUser = async (req, res, next) => {
  try {
    next(await validateBody(UpdateBodySchema, req.body))
  } catch (error) {
    next(
      new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
      )
    )
  }
}

export const userValidation = {
  register,
  verify,
  sendOtp,
  forgotPassword,
  resetPassword,
  login,
  updateUser
}
