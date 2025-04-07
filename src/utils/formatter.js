import { pick } from 'lodash'
import { OBJECT_ID_RULE } from './validators'
import { ObjectId } from 'mongodb'

export const pickUser = (user) => {
  if (!user) return null
  return pick(user, [
    '_id',
    'email',
    'username',
    'displayName',
    'avatar',
    'role',
    'isVerified',
    'createdAt',
    'updatedAt'
  ])
}

export const cloudinarySecureUrl2PublicId = (folderName, secure_url) =>
  `${folderName}${secure_url.split(folderName)[1].replace(/\.[^.]+$/, '')}`

export const objectPropertiesStringId2ObjectId = (object) => {
  for (const [key, value] of Object.entries(object)) {
    if (OBJECT_ID_RULE.test(value)) {
      object[key] = new ObjectId(value)
    }
  }

  return object
}

export const validateBody = async (schema, body) => {
  return schema.validateAsync(body)
}
