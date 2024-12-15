import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (data) => {
  try {
    const createdCard = await cardModel.createNew({
      ...data
    })

    const card = await cardModel.findOneById(createdCard.insertedId)

    if (card) {
      await columnModel.pushCardOrderIds(card)
    }

    return card
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew
}
