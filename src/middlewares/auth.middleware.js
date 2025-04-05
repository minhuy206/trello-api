import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/jwt.provider'
import CustomAPIError from '~/utils/CustomAPIError'

const isAuthorized = async (req, res, next) => {
  // const clientAccessToken = req.cookies?.accessToken
  const clientAccessToken = req.headers?.authorization?.split(' ')[1]
  if (!clientAccessToken) {
    next(
      new CustomAPIError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized! (token not found)'
      )
    )
    return
  }
  try {
    const accessTokenDecoded = await JwtProvider.isVerified(
      clientAccessToken,
      env.ACCESS_TOKEN_PRIVATE_KEY
    )

    req.jwtDecoded = accessTokenDecoded
    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      next(new CustomAPIError(StatusCodes.GONE, 'Unauthorized!'))
      return
    }
    next(new CustomAPIError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}
