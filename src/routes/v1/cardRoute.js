import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  cardValidation.create,
  cardController.create
)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, cardController.getCard)
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.update,
    cardController.update
  )

export const cardRoute = Router
