import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const create = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json(await cardService.create(req.body))
  } catch (error) {
    next(error)
  }
}

const getCard = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await cardService.getCard(req.jwtDecoded.id, req.params.id))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await cardService.update(req.params.id, req.body, req.file))
  } catch (error) {
    next(error)
  }
}

export const cardController = {
  create,
  getCard,
  update
}
