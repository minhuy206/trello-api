import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { ObjectId } from 'mongodb'
import { env } from '~/config/environment'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import CustomAPIError from '~/utils/CustomAPIError'
import { CARD_MEMBER_ACTION } from '~/utils/constants'
import { cloudinarySecureUrl2PublicId } from '~/utils/formatter'

const create = async (card) => {
  try {
    const newCard = await cardModel.find(
      (
        await cardModel.create({
          ...card
        })
      ).insertedId
    )

    if (newCard) {
      await columnModel.updateCardOrderIds(newCard, '$push')
    }

    return newCard
  } catch (error) {
    throw error
  }
}

const getCard = async (userId, cardId) => {
  try {
    const card = await cardModel.getCard(userId, cardId)
    if (!card) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Card not found')
    }

    const resCard = cloneDeep(card)
    resCard.comments.forEach(
      (comment) =>
        (comment.user = resCard.users.find((user) =>
          user._id.equals(comment.userId)
        ))
    )
    delete resCard.users
    return resCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, card, cardCover) => {
  try {
    const existedCard = await cardModel.find(cardId)

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

    if (card.updateCardMemberIdData) {
      if (card.updateCardMemberIdData.action === CARD_MEMBER_ACTION.ADD) {
        card.memberIds = [
          ...existedCard.memberIds,
          new ObjectId(card.updateCardMemberIdData.memberId)
        ]
      } else if (
        card.updateCardMemberIdData.action === CARD_MEMBER_ACTION.REMOVE
      ) {
        card.memberIds = existedCard.memberIds.filter(
          (memberId) =>
            memberId.toString() !== card.updateCardMemberIdData.memberId
        )
      }
      delete card.updateCardMemberIdData
    }

    return await cardModel.update(cardId, {
      ...card,
      updatedAt: Date.now()
    })
  } catch (error) {
    throw error
  }
}

export const cardService = {
  create,
  getCard,
  update
}
