import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'

import CustomAPIError from '~/utils/CustomAPIError'
import { INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatter'
import { boardRepository } from '../boards/board.repo'
import { userRepository } from '../users/user.repo'
import { validateBody } from '~/utils/formatter'
import { InvitationSchema } from './invitation.model'
import { invitationRepository } from './invitation.repo'

const createInvitation = async ({ inviteeEmail, boardId }, userId) => {
  try {
    const [board, createdBy, invitee] = await Promise.all([
      boardRepository.find({ _id: boardId }),
      userRepository.findUser({ _id: userId }),
      userRepository.findUser({ email: inviteeEmail })
    ])

    if (!invitee || !createdBy || !board) {
      throw new CustomAPIError(
        StatusCodes.NOT_FOUND,
        !invitee
          ? 'Invitee not found'
          : !createdBy
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

    const invitation = await invitationRepository.find({
      _id: (
        await invitationRepository.createInvitation(
          await validateBody(InvitationSchema, {
            createdById: userId,
            inviteeId: invitee._id.toString(),
            boardId: boardId,
            status: INVITATION_STATUS.PENDING
          })
        )
      ).insertedId
    })

    return {
      _id: invitation._id,
      boardId: invitation.boardId,
      status: invitation.status,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
      createdBy: pickUser(createdBy),
      invitee: pickUser(invitee)
    }
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    return (await invitationRepository.findByUser(userId)).map((invitation) => {
      return {
        ...invitation,
        board: invitation.board[0] || {},
        createdBy: invitation.createdBy[0] || {},
        invitee: invitation.invitee[0] || {}
      }
    })
  } catch (error) {
    throw error
  }
}

const updateInvitation = async (invitationId, userId, body) => {
  try {
    const targetInvitation = await invitationRepository.find({
      _id: invitationId
    })
    if (!targetInvitation) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Invitation not found')
    }

    const targetBoard = await boardRepository.find({
      _id: targetInvitation.boardId
    })
    if (!targetBoard) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    if (!targetInvitation.inviteeId.equals(userId)) {
      throw new CustomAPIError(
        StatusCodes.NOT_ACCEPTABLE,
        'You are not authorized to update this invitation'
      )
    }

    const boardUsers = [
      ...targetBoard.ownerIds,
      ...targetBoard.memberIds
    ].toString()

    if (
      body.status === INVITATION_STATUS.ACCEPTED &&
      boardUsers.includes(userId)
    ) {
      throw new CustomAPIError(
        StatusCodes.NOT_ACCEPTABLE,
        'You are already a member of this board'
      )
    } else if (body.status === INVITATION_STATUS.ACCEPTED) {
      const [invitation, , createdBy, invitee] = await Promise.all([
        invitationRepository.update(body, {
          boardId: targetBoard._id,
          inviteeId: userId,
          status: INVITATION_STATUS.PENDING,
          createdById: targetInvitation.createdById
        }),
        boardRepository.update(targetBoard._id, {
          memberIds: [...targetBoard.memberIds, new ObjectId(userId)]
        }),
        userRepository.find({ _id: userId }),
        userRepository.find({ _id: targetInvitation.inviteeId })
      ])

      return {
        boardId: invitation.boardId,
        invitee: pickUser(invitee),
        status: invitation.status,
        createdBy: pickUser(createdBy),
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt
      }
    } else if (body.status === INVITATION_STATUS.REJECTED) {
      const [invitation, , createdBy, invitee] = await Promise.all([
        invitationRepository.update(body, {
          boardId: targetBoard._id,
          inviteeId: userId,
          status: INVITATION_STATUS.PENDING,
          createdById: targetInvitation.createdById
        }),
        boardRepository.update(targetBoard._id, {
          memberIds: [...targetBoard.memberIds, new ObjectId(userId)]
        }),
        userRepository.find({ _id: userId }),
        userRepository.find({ _id: targetInvitation.inviteeId })
      ])

      return {
        boardId: invitation.boardId,
        invitee: pickUser(invitee),
        status: invitation.status,
        createdBy: pickUser(createdBy),
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt
      }
    }
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createInvitation,
  getInvitations,
  updateInvitation
}
