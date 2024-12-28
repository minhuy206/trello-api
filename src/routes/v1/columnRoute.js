import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  columnValidation.create,
  columnController.create
)
Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    columnValidation.update,
    columnController.update
  )
  .delete(
    authMiddleware.isAuthorized,
    columnValidation.deleteColumn,
    columnController.deleteColumn
  )

export const columnRoute = Router
