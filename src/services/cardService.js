import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

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
const update = async (cardId, card) => {
  try {
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
