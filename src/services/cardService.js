import { ObjectId } from 'mongodb'
import { env } from '~/config/environment'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
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

const update = async (
  cardId,
  { id: userId, email: userEmail },
  card,
  cardCover
) => {
  try {
    const existedCard = await cardModel.find(cardId)

    if (cardCover) {
      card.cover = (
        await CloudinaryProvider.uploadImage(
          cardCover.buffer,
          `${env.CLOUDINARY_BOARDS_COLLECTION_NAME}/${existedCard.boardId}/${env.CLOUDINARY_COLUMNS_COLLECTION_NAME}/${existedCard.columnId}/${env.CLOUDINARY_CARDS_COLLECTION_NAME}/${cardId}/cover`
        )
      )?.secure_url

      existedCard.cover &&
        (await CloudinaryProvider.deleteImage(
          cloudinarySecureUrl2PublicId(
            `${env.CLOUDINARY_BOARDS_COLLECTION_NAME}/${existedCard.boardId}/${env.CLOUDINARY_COLUMNS_COLLECTION_NAME}/${existedCard.columnId}/${env.CLOUDINARY_CARDS_COLLECTION_NAME}/${cardId}/cover`,
            existedCard.cover
          )
        ))
    }

    if (card.comment) {
      return await cardModel.unShiftComment(cardId, {
        user: {
          _id: userId,
          email: userEmail,
          ...card.comment.user
        },
        content: card.comment.content,
        commentedAt: Date.now()
      })
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
  update
}
