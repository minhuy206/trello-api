import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import { invitationModel } from '~/models/invitationModel'
import CustomAPIError from '~/utils/CustomAPIError'
import { INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatter'

const createBoardInvitation = async ({
  boardId,
  body: { inviteeEmail },
  userId
}) => {
  try {
    const [board, inviter, invitee] = await Promise.all([
      boardModel.find(boardId),
      userModel.find('_id', userId),
      userModel.find('email', inviteeEmail)
    ])

    if (!invitee || !inviter || !board) {
      throw new CustomAPIError(
        StatusCodes.NOT_FOUND,
        !invitee
          ? 'Invitee not found'
          : !inviter
          ? 'Inviter not found'
          : 'Board not found'
      )
    } else if (board.memberIds.toString().includes(invitee._id.toString())) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Invitee is already a member of this board'
      )
    } else if (invitee._id.equals(userId)) {
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'You cannot invite yourself'
      )
    }

    const invitation = await invitationModel.find(
      (
        await invitationModel.createBoardInvitation({
          inviterId: userId,
          inviteeId: invitee._id.toString(),
          boardId: boardId,
          status: INVITATION_STATUS.PENDING
        })
      ).insertedId
    )

    return {
      ...invitation,
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

const updateInvitation = async ({ invitationId, userId, body }) => {
  try {
    const invitation = await invitationModel.find(invitationId)
    if (!invitation) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Invitation not found')
    }

    const board = await boardModel.find(invitation.boardId)
    if (!board) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    if (!invitation.inviteeId.equals(userId)) {
      throw new CustomAPIError(
        StatusCodes.NOT_ACCEPTABLE,
        'You are not authorized to update this invitation'
      )
    }

    const boardUsers = [...board.ownerIds, ...board.memberIds].toString()

    if (
      body.status === INVITATION_STATUS.ACCEPTED &&
      boardUsers.includes(userId)
    ) {
      throw new CustomAPIError(
        StatusCodes.NOT_ACCEPTABLE,
        'You are already a member of this board'
      )
    } else if (body.status === INVITATION_STATUS.ACCEPTED) {
      return await Promise.all([
        invitationModel.update(body, {
          boardId: board._id,
          inviteeId: userId,
          status: INVITATION_STATUS.PENDING,
          inviterId: invitation.inviterId
        }),
        boardModel.update(board._id, {
          memberIds: [...board.memberIds, new ObjectId(userId)]
        })
      ])
    } else if (body.status === INVITATION_STATUS.REJECTED) {
      return await invitationModel.update(body, {
        boardId: board._id,
        inviteeId: userId,
        status: INVITATION_STATUS.PENDING,
        inviterId: invitation.inviterId
      })
    }
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createBoardInvitation,
  getInvitations,
  updateInvitation
}
