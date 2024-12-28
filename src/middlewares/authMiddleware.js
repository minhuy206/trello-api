import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)')
    )
    return
  }

  try {
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_PRIVATE_KEY
    )
    req.jwtDecoded = accessTokenDecoded
    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Unauthorized! (token expired)'))
      return
    }
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}
