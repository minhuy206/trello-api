import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'

const Router = express.Router()

Router.route('/').post(cardValidation.create, cardController.create)

export const cardRoute = Router
