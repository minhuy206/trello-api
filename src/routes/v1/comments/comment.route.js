import express from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { commentValidation } from './comment.validation'
import { commentController } from './comment.controller'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  commentValidation.create,
  commentController.create
)

Router.route('/:commentId').put(
  authMiddleware.isAuthorized,
  commentValidation.update,
  commentController.update
)

export const commentRoute = Router
