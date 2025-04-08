import express from 'express'

import { authMiddleware } from '~/middlewares/auth.middleware'
import { invitationController } from './invitation.controller'
import { invitationValidation } from './invitation.validation'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, invitationController.getInvitations)
  .post(
    authMiddleware.isAuthorized,
    invitationValidation.createInvitation,
    invitationController.createInvitation
  )

Router.route('/:invitationId').put(
  authMiddleware.isAuthorized,
  invitationValidation.updateInvitation,
  invitationController.updateInvitation
)

export const invitationRoute = Router
