import express from 'express'

import { authMiddleware } from '~/middlewares/auth.middleware'
import { columnValidation } from './column.validation'
import { columnController } from './column.controller'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  columnValidation.create,
  columnController.create
)

Router.route('/:columnId')
  .get(
    authMiddleware.isAuthorized,
    columnValidation.getColumn,
    columnController.getColumn
  )
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
