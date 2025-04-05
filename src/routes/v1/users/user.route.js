import express from 'express'
import { userValidation } from './user.validation'
import { userController } from './user.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { multerUploadMiddleware } from '~/middlewares/multerUpload.middleware'

const Router = express.Router()

Router.route('/register').post(userValidation.register, userController.register)

Router.route('/login').post(userValidation.login, userController.login)

Router.route('/verify').put(userValidation.verify, userController.verify)

Router.route('/send-otp').post(userValidation.sendOtp, userController.sendOtp)

Router.route('/forgot-password').post(
  userValidation.forgotPassword,
  userController.forgotPassword
)

Router.route('/reset-password').put(
  userValidation.resetPassword,
  userController.resetPassword
)

Router.route('/logout').delete(userController.logout)

Router.route('/update').put(
  authMiddleware.isAuthorized,
  multerUploadMiddleware.upload.single('avatar'),
  userValidation.updateUser,
  userController.updateUser
)

Router.route('/delete-avatar').delete(
  authMiddleware.isAuthorized,
  userController.deleteAvatar
)

Router.route('/refresh-token').get(userController.refreshToken)

export const userRoute = Router
