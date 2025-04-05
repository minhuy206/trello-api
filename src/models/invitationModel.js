import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { INVITATION_STATUS } from '~/utils/constants'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { userModel } from './userModel'
import { boardModel } from './boardModel'
import { objectPropertiesStringId2ObjectId } from '~/utils/formatter'

const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_SCHEMA = Joi.object({
  inviterId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  inviteeId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  boardId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  status: Joi.string()
    .valid(...Object.values(INVITATION_STATUS))
    .required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await INVITATION_SCHEMA.validateAsync(data)
}

const createBoardInvitation = async (data) => {
  try {
    const validatedInvitation = await validateBeforeCreate(data)

    return await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .insertOne(objectPropertiesStringId2ObjectId(validatedInvitation))
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
            from: userModel.USERS_COLLECTION_NAME,
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter',
            pipeline: [{ $project: { password: 0, isVerified: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USERS_COLLECTION_NAME,
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { password: 0, isVerified: 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARDS_COLLECTION_NAME,
            localField: 'boardId',
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

const update = async (body, filter) => {
  try {
    return await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .updateOne(
        objectPropertiesStringId2ObjectId(filter),
        {
          $set: {
            ...body,
            updatedAt: new Date()
          }
        },
        {
          returnDocument: 'after'
        }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const deleteInvitation = async (uniqueObject) => {
  try {
    return await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .deleteOne(objectPropertiesStringId2ObjectId(uniqueObject))
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
  update,
  deleteInvitation
}
