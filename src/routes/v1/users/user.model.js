import Joi from 'joi'
import { USER_ROLES } from '~/utils/constants'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  USERNAME_RULE,
  USERNAME_RULE_MESSAGE
} from '~/utils/validators'

export const UserSchema = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string()
    .required()
    .pattern(USERNAME_RULE)
    .message(USERNAME_RULE_MESSAGE),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string()
    .valid(USER_ROLES.ADMIN, USER_ROLES.CLIENT)
    .default(USER_ROLES.CLIENT),
  isVerified: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const OtpSchema = Joi.object({
  hashOtp: Joi.string().required(),
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  expireAt: Joi.date()
    .timestamp('javascript')
    .default(Date.now() + 300 * 1000)
})

export const PasswordResetTokenSchema = Joi.object({
  token: Joi.string().required(),
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  createdAt: Joi.date().timestamp('javascript').default(new Date()),
  expireAt: Joi.date()
    .timestamp('javascript')
    .default(new Date(Date.now() + 300 * 1000))
})

export const RegisterBodySchema = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  username: Joi.string()
    .required()
    .pattern(USERNAME_RULE)
    .message(USERNAME_RULE_MESSAGE),
  password: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE),
  confirmPassword: Joi.string().required().messages({
    'any.required': 'Confirm password is required'
  })
})
  .with('password', 'confirmPassword')
  .messages({
    'object.with': '"password" and "confirmPassword" must match'
  })

export const LoginBodySchema = Joi.object({
  email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  username: Joi.string().pattern(USERNAME_RULE).message(USERNAME_RULE_MESSAGE),
  password: Joi.string().required()
})
  .xor('email', 'username')
  .messages({
    'object.xor': 'Only either email or username is required'
  })

export const VerifyBodySchema = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  otp: Joi.string().required()
})

export const SendOtpBodySchema = Joi.object({
  email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  username: Joi.string().pattern(USERNAME_RULE).message(USERNAME_RULE_MESSAGE)
})
  .xor('email', 'username')
  .messages({
    'object.xor': 'Only either email or username is required'
  })

export const ForgotPasswordBodySchema = SendOtpBodySchema

export const ResetPasswordBodySchema = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  token: Joi.string().required(),
  password: Joi.string()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE)
    .required(),
  confirmPassword: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE)
}).with('password', 'confirmPassword')

export const UpdateBodySchema = Joi.object({
  displayName: Joi.string().trim().strict(),
  username: Joi.string().pattern(USERNAME_RULE).message(USERNAME_RULE_MESSAGE),
  currentPassword: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE),
  newPassword: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE)
}).or('username', 'displayName', 'newPassword')
