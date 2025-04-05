import { StatusCodes } from 'http-status-codes'
import { cardService } from './card.service'

const create = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.CREATED)
      .json(await cardService.create(req.jwtDecoded.id, req.body))
  } catch (error) {
    next(error)
  }
}

const getCard = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await cardService.getCard(req.jwtDecoded.id, req.params.cardId))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(
        await cardService.update(
          req.params.id,
          req.body,
          req.file,
          req.jwtDecoded.id
        )
      )
  } catch (error) {
    next(error)
  }
}

const deleteCard = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(await cardService.deleteCard(req.params.id, req.jwtDecoded.id))
  } catch (error) {
    next(error)
  }
}

export const cardController = {
  create,
  getCard,
  update,
  deleteCard
}
