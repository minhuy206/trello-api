import { pick } from 'lodash'

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
