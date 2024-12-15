import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (data) => {
  try {
    const createdColumn = await columnModel.createNew({
      ...data
    })

    const column = await columnModel.findOneById(createdColumn.insertedId)

    if (column) {
      column.cards = []
      await boardModel.pushColumnOrderIds(column)
    }

    return column
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew
}
