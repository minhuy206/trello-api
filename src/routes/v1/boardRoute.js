import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(
    authMiddleware.isAuthorized,
    boardValidation.create,
    boardController.create
  )

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getBoard)
  .put(
    authMiddleware.isAuthorized,
    boardValidation.update,
    boardController.update
  )

export const boardRoute = Router
