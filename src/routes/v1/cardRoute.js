import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  cardValidation.create,
  cardController.create
)

export const cardRoute = Router
