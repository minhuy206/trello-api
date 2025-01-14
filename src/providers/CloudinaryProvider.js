import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

const uploadImage = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }
      }
    )
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

const deleteImage = (publicId) => {
  cloudinary.uploader.destroy(publicId)
}

const deleteImages = (prefix) => {
  cloudinary.api.delete_resources_by_prefix(prefix)
}

const deleteFolder = (folderName) => {
  cloudinary.api.delete_folder(folderName)
}

export const CloudinaryProvider = {
  uploadImage,
  deleteImage,
  deleteImages,
  deleteFolder
}
