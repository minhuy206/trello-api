import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from './users/user.route'
import { boardRoute } from './boards/board.route'
import { columnRoute } from './columns/column.route'
import { commentRoute } from './comments/comment.route'
import { cardRoute } from './cards/card.route'
import { invitationRoute } from './invitations/invitation.route'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use' })
})

Router.use('/boards', boardRoute)

Router.use('/columns', columnRoute)

Router.use('/cards', cardRoute)

Router.use('/users', userRoute)

Router.use('/comments', commentRoute)

Router.use('/invitations', invitationRoute)

export const APIs_V1 = Router
