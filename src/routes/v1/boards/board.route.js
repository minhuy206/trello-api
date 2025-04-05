import express from 'express'

import { authMiddleware } from '~/middlewares/auth.middleware'
import { boardController } from './board.controller'
import { boardValidation } from './board.validation'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(
    authMiddleware.isAuthorized,
    boardValidation.create,
    boardController.create
  )

Router.route('/:boardId')
  .get(
    authMiddleware.isAuthorized,
    boardValidation.getBoard,
    boardController.getBoard
  )
  .put(
    authMiddleware.isAuthorized,
    boardValidation.update,
    boardController.update
  )

export const boardRoute = Router
