import express from 'express'

import { authMiddleware } from '~/middlewares/auth.middleware'
import { multerUploadMiddleware } from '~/middlewares/multerUpload.middleware'
import { cardController } from './card.controller'
import { cardValidation } from './card.validation'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  cardValidation.create,
  cardController.create
)

Router.route('/:cardId')
  .get(
    authMiddleware.isAuthorized,
    cardValidation.getCard,
    cardController.getCard
  )
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.update,
    cardController.update
  )
  .delete(
    authMiddleware.isAuthorized,
    cardValidation.deleteCard,
    cardController.deleteCard
  )

export const cardRoute = Router
