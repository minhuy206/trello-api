import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const create = async (req, res, next) => {
  try {
    const createdCard = await cardService.create(req.body)

    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) {
    next(error)
  }
}

export const cardController = {
  create
}
