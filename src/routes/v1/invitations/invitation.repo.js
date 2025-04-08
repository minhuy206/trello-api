import { env } from '~/config/environment'
import { objectPropertiesStringId2ObjectId } from '~/utils/formatter'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

// const createInvitation = (body) => {
//   try {
//     return GET_DB()
//       .collection(env.MONGODB_INVITATIONS_COLLECTION_NAME)
//       .insertOne(objectPropertiesStringId2ObjectId(body))
//   } catch (error) {
//     throw new Error(error)
//   }
// }
const createInvitation = async (body, filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_INVITATIONS_COLLECTION_NAME)
      .findOneAndUpdate(
        objectPropertiesStringId2ObjectId(filter),
        {
          $set: objectPropertiesStringId2ObjectId(body)
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const findByUser = (userId) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_INVITATIONS_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: [
              {
                inviteeId: new ObjectId(userId)
              }
            ]
          }
        },
        {
          $lookup: {
            from: env.MONGODB_USERS_COLLECTION_NAME,
            localField: 'createdById',
            foreignField: '_id',
            as: 'createdBy',
            pipeline: [{ $project: { password: 0, isVerified: 0 } }]
          }
        },
        {
          $lookup: {
            from: env.MONGODB_USERS_COLLECTION_NAME,
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { password: 0, isVerified: 0 } }]
          }
        },
        {
          $lookup: {
            from: env.MONGODB_BOARDS_COLLECTION_NAME,
            localField: 'boardId',
            foreignField: '_id',
            as: 'board'
          }
        },
        {
          $unwind: {
            path: '$createdBy',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$board',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const find = (filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_INVITATIONS_COLLECTION_NAME)
      .findOne(objectPropertiesStringId2ObjectId(filter))
  } catch (error) {
    throw new Error(error)
  }
}

const update = (body, filter) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_INVITATIONS_COLLECTION_NAME)
      .findOneAndUpdate(
        objectPropertiesStringId2ObjectId(filter),
        {
          $set: {
            ...objectPropertiesStringId2ObjectId(body),
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

const deleteInvitation = (uniqueObject) => {
  try {
    return GET_DB()
      .collection(env.MONGODB_INVITATIONS_COLLECTION_NAME)
      .deleteOne(objectPropertiesStringId2ObjectId(uniqueObject))
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationRepository = {
  createInvitation,
  find,
  findByUser,
  update,
  deleteInvitation
}
