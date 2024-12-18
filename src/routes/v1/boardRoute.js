import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'

const Router = express.Router()

Router.route('/')
  .get()
  .post(boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(boardController.getBoard)
  .put(boardValidation.update, boardController.update)

export const boardRoute = Router
