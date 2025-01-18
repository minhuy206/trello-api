import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/register').post(userValidation.create, userController.create)

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

Router.route('/login').post(userValidation.login, userController.login)

Router.route('/logout').delete(userController.logout)

Router.route('/update').put(
  authMiddleware.isAuthorized,
  multerUploadMiddleware.upload.single('avatar'),
  userValidation.update,
  userController.update
)

Router.route('/refresh-token').get(userController.refreshToken)

export const userRoute = Router
