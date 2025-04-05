import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

const register = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json(await userService.register(req.body))
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(await userService.login(req.body))
  } catch (error) {
    next(error)
  }
}

const verify = async (req, res, next) => {
  try {
    res.status(StatusCodes.ACCEPTED).json(await userService.verify(req.body))
  } catch (error) {
    next(error)
  }
}

const sendOtp = async (req, res, next) => {
  try {
    res.status(StatusCodes.ACCEPTED).json(await userService.sendOtp(req.body))
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.ACCEPTED)
      .json(await userService.forgotPassword(req.body))
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.NO_CONTENT)
      .json(await userService.resetPassword(req.body))
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.NO_CONTENT).json({ loggedOut: true })
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.OK)
      .json(await userService.update(req.jwtDecoded.id, req.body, req.file))
  } catch (error) {
    next(error)
  }
}

const deleteAvatar = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.OK)
      .json(await userService.deleteAvatar(req.jwtDecoded.id))
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.NO_CONTENT).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please login to continue'))
  }
}

export const userController = {
  register,
  login,
  verify,
  sendOtp,
  forgotPassword,
  resetPassword,
  logout,
  update,
  deleteAvatar,
  refreshToken
}
