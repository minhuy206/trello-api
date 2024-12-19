import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

const create = async (column) => {
  try {
    const createdColumn = await columnModel.create({
      ...column
    })

    const newColumn = await columnModel.find(createdColumn.insertedId)

    if (newColumn) {
      newColumn.cards = []
      await boardModel.pushColumnOrderIds(newColumn)
    }

    return newColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, data) => {
  try {
    return await columnModel.update(columnId, data.cardId, {
      ...data.column,
      updatedAt: Date.now()
    })
  } catch (error) {
    throw error
  }
}

export const columnService = {
  create,
  update
}
