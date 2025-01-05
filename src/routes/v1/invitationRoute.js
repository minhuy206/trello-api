import express from 'express'
import { invitationValidation } from '~/validations/invitationValidation'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/').get(
  authMiddleware.isAuthorized,
  invitationController.getInvitations
)

Router.route('/:id').put(
  authMiddleware.isAuthorized,
  invitationController.updateInvitation
)

Router.route('/boards/:id').post(
  authMiddleware.isAuthorized,
  invitationValidation.createBoardInvitation,
  invitationController.createBoardInvitation
)

export const invitationRoute = Router
