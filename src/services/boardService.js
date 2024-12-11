/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'

const createNew = async (data) => {
  try {
    const createdBoard = await boardModel.createNew({
      ...data,
      slug: slugify(data.title)
    })

    return await boardModel.findOneById(createdBoard.insertedId)
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
