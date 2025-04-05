import { pick } from 'lodash'
import { OBJECT_PROPERTY_ID_RULE } from './validators'
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
  Object.keys(object).forEach((key) => {
    if (OBJECT_PROPERTY_ID_RULE.test(key)) {
      object[key] = new ObjectId(object[key])
    }
  })
  return object
}
