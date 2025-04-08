import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import CustomAPIError from '~/utils/CustomAPIError'
import { cloudinarySecureUrl2PublicId } from '~/utils/formatter'
import { cardRepository } from './card.repo'
import { columnRepository } from '../columns/column.repo'
import { validateBody } from '~/utils/formatter'
import { CardSchema } from './card.model'
import { boardRepository } from '../boards/board.repo'
import { commentRepository } from '../comments/comment.repo'

const create = async (userId, body) => {
  try {
    const [targetBoard, targetColumn] = await Promise.all([
      boardRepository.find({ _id: body.boardId }),
      columnRepository.find({ _id: body.columnId })
    ])

    if (!targetBoard) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    if (!targetColumn) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    const newCard = await cardRepository.find({
      _id: (
        await cardRepository.create(
          await validateBody(CardSchema, { ...body, createdById: userId })
        )
      ).insertedId
    })

    if (newCard) {
      await columnRepository.updateCardOrderIds(newCard, '$push')
    }

    return newCard
  } catch (error) {
    throw error
  }
}

const getCard = async (userId, cardId) => {
  try {
    const card = await cardRepository.getCardIncludeComments(userId, cardId)
    if (!card) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Card not found')
    }

    return card
  } catch (error) {
    throw error
  }
}

const update = async (cardId, card, cardCover) => {
  try {
    const existedCard = await cardRepository.find({ _id: cardId })

    if (cardCover) {
      const [cover] = await Promise.all([
        CloudinaryProvider.uploadImage(
          cardCover.buffer,
          `${env.PROJECT_NAME}/${env.CLOUDINARY_BOARDS_COLLECTION_NAME}/${existedCard.boardId}/${env.CLOUDINARY_COLUMNS_COLLECTION_NAME}/${existedCard.columnId}/${env.CLOUDINARY_CARDS_COLLECTION_NAME}/${cardId}/cover`
        ),
        existedCard.cover &&
          CloudinaryProvider.deleteImage(
            cloudinarySecureUrl2PublicId(
              `${env.PROJECT_NAME}/${env.CLOUDINARY_BOARDS_COLLECTION_NAME}/${existedCard.boardId}/${env.CLOUDINARY_COLUMNS_COLLECTION_NAME}/${existedCard.columnId}/${env.CLOUDINARY_CARDS_COLLECTION_NAME}/${cardId}/cover`,
              existedCard.cover
            )
          )
      ])
      card.cover = cover.secure_url
    }

    if (existedCard.columnId !== card?.columnId) {
      await commentRepository.updateComments(
        { cardId },
        { columnId: card.columnId }
      )
    }
    const updatedCard = await cardRepository.update(cardId, {
      ...card,
      updatedAt: Date.now()
    })

    return updatedCard
  } catch (error) {
    throw error
  }
}

const deleteCard = async (cardId) => {
  try {
    const targetCard = await cardRepository.find({ _id: cardId })
    if (!targetCard) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Card not found')
    }

    const [, ,] = await Promise.all([
      cardRepository.deleteCard(cardId),
      commentRepository.deleteComments({ cardId }),
      columnRepository.updateCardOrderIds(targetCard, '$pull'),
      targetCard.cover &&
        CloudinaryProvider.deleteImages(
          `${env.PROJECT_NAME}/${
            env.CLOUDINARY_BOARDS_COLLECTION_NAME
          }/${targetCard.boardId.toString()}/${
            env.CLOUDINARY_COLUMNS_COLLECTION_NAME
          }/${targetCard.columnId.toString()}/${
            env.CLOUDINARY_CARDS_COLLECTION_NAME
          }/${targetCard._id.toString()}`
        )
    ])

    return { message: 'Card deleted successfully' }
  } catch (error) {
    throw error
  }
}

export const cardService = {
  create,
  getCard,
  update,
  deleteCard
}
