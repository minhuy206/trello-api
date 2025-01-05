import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { INVITATION_STATUS } from '~/utils/constants'
import { INVITATION_TYPES } from '~/utils/constants'
import { invitationModel } from '~/models/invitationModel'
import { pickUser } from '~/utils/formatter'

const createBoardInvitation = async (boardId, { inviteeEmail }, userId) => {
  try {
    const inviter = await userModel.find('_id', userId)
    const invitee = await userModel.find('email', inviteeEmail)

    const board = await boardModel.find(boardId)

    if (!invitee || !inviter || !board) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        !invitee
          ? 'Invitee not found'
          : !inviter
          ? 'Inviter not found'
          : 'Board not found'
      )
    } else if (board.memberIds.includes(invitee._id)) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Invitee is already a member of this board'
      )
    } else if (invitee._id.equals(userId)) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'You cannot invite yourself'
      )
    }

    const resInvitation = await invitationModel.find(
      (
        await invitationModel.createBoardInvitation({
          inviterId: inviter._id.toString(),
          inviteeId: invitee._id.toString(),
          type: INVITATION_TYPES.BOARD_INVITATION,
          boardInvitation: {
            boardId: board._id.toString(),
            status: INVITATION_STATUS.PENDING
          }
        })
      ).insertedId
    )

    return {
      ...resInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    return (await invitationModel.findByUser(userId)).map((invitation) => {
      return {
        ...invitation,
        board: invitation.board[0] || {},
        inviter: invitation.inviter[0] || {},
        invitee: invitation.invitee[0] || {}
      }
    })
  } catch (error) {
    throw error
  }
}

const updateInvitation = async (invitationId, userId, { status }) => {
  try {
    const invitation = await invitationModel.find(invitationId)
    if (!invitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')
    }

    const board = await boardModel.find(invitation.boardInvitation.boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    if (!invitation.inviteeId.equals(userId)) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'You are not authorized to update this invitation'
      )
    }

    const boardUsers = [...board.ownerIds, ...board.memberIds].toString()

    if (status === INVITATION_STATUS.ACCEPTED && boardUsers.includes(userId)) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'You are already a member of this board'
      )
    }

    const updatedInvitation = await invitationModel.update(invitationId, {
      boardInvitation: { ...invitation.boardInvitation, status }
    })

    if (
      updatedInvitation.boardInvitation.status === INVITATION_STATUS.ACCEPTED
    ) {
      await boardModel.update(board._id, {
        memberIds: [...board.memberIds, userId]
      })
    }
    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createBoardInvitation,
  getInvitations,
  updateInvitation
}
