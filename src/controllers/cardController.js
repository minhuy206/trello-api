import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const create = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json(await cardService.create(req.body))
  } catch (error) {
    next(error)
  }
}

export const cardController = {
  create
}
