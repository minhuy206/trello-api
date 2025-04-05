import express from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { commentValidation } from '~/validations/commentValidation'
import { commentController } from '~/controllers/commentController'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  commentValidation.create,
  commentController.create
)

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  commentValidation.update,
  commentController.update
)

export const commentRoute = Router
