import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'

const Router = express.Router()

Router.route('/').post(columnValidation.create, columnController.create)
Router.route('/:id').put(columnValidation.update, columnController.update)

export const columnRoute = Router
