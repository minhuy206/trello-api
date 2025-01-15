import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { userModel } from './userModel'
import { boardModel } from './boardModel'

const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_SCHEMA = Joi.object({
  inviterId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  inviteeId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  type: Joi.string().valid(...Object.values(INVITATION_TYPES)),
  boardInvitation: Joi.object({
    boardId: Joi.string().pattern(OBJECT_ID_RULE).required(),
    status: Joi.string().valid(...Object.values(INVITATION_STATUS))
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = [
  '_id',
  'type',
  'inviterId',
  'inviteeId',
  'createdAt'
]

const validateBeforeCreate = async (data) => {
  return await INVITATION_SCHEMA.validateAsync(data)
}

const createBoardInvitation = async (data) => {
  try {
    const validatedInvitation = await validateBeforeCreate(data)

    if (validatedInvitation.boardInvitation) {
      return await GET_DB()
        .collection(INVITATION_COLLECTION_NAME)
        .insertOne({
          ...validatedInvitation,
          inviterId: new ObjectId(validatedInvitation.inviterId),
          inviteeId: new ObjectId(validatedInvitation.inviteeId),
          boardInvitation: {
            ...validatedInvitation.boardInvitation,
            boardId: new ObjectId(validatedInvitation.boardInvitation.boardId)
          }
        })
    }

    return await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .insertOne({
        ...validatedInvitation,
        inviterId: new ObjectId(validatedInvitation.inviterId),
        inviteeId: new ObjectId(validatedInvitation.inviteeId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const findByUser = async (userId) => {
  try {
    return await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: [
              {
                inviteeId: new ObjectId(userId)
              },
              { _destroy: false }
            ]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARDS_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'board'
          }
        }
      ])
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const find = async (invitationId) => {
  try {
    return await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(invitationId) })
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (invitationId, invitation) => {
  try {
    Object.keys(invitation).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete invitation[key]
      }
    })

    if (invitation.boardInvitation) {
      invitation.boardInvitation = {
        ...invitation.boardInvitation,
        boardId: new ObjectId(invitation.boardInvitation.boardId)
      }
    }

    return await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(invitationId)
        },
        {
          $set: invitation
        },
        {
          returnDocument: 'after'
        }
      )
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_SCHEMA,
  createBoardInvitation,
  find,
  findByUser,
  update
}
