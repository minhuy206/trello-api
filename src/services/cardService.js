import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const create = async (card) => {
  try {
    const createdCard = await cardModel.create({
      ...card
    })

    const newCard = await cardModel.find(createdCard.insertedId)

    if (newCard) {
      await columnModel.updateCardOrderIds(newCard, '$push')
    }

    return newCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  create
}
