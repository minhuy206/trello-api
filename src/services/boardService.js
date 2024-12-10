import { slugify } from '~/utils/formatter'

const createNew = async (data) => {
  try {
    const newBoard = {
      ...data,
      slug: slugify(data.title)
    }

    return newBoard
  } catch (error) {
    throw new Error(error)
  }
}

export const boardService = {
  createNew
}
