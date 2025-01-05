import { StatusCodes } from 'http-status-codes'
import { invitationService } from '~/services/invitationService'

const createBoardInvitation = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.CREATED)
      .json(
        await invitationService.createBoardInvitation(
          req.params.id,
          req.body,
          req.jwtDecoded.id
        )
      )
  } catch (error) {
    next(error)
  }
}

const getInvitations = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.OK)
      .json(await invitationService.getInvitations(req.jwtDecoded.id))
  } catch (error) {
    next(error)
  }
}

const updateInvitation = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.OK)
      .json(
        await invitationService.updateInvitation(
          req.params.id,
          req.jwtDecoded.id,
          req.body
        )
      )
  } catch (error) {
    next(error)
  }
}

export const invitationController = {
  createBoardInvitation,
  getInvitations,
  updateInvitation
}
