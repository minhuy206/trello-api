import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { commentModel } from '~/models/commentModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import ApiError from '~/utils/ApiError'

const create = async (column) => {
  try {
    const newColumn = await columnModel.find(
      (
        await columnModel.create({
          ...column
        })
      ).insertedId
    )

    if (newColumn) {
      newColumn.cards = []
      await boardModel.updateColumnOrderIds(newColumn, '$push')
    }

    return newColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, column) => {
  try {
    return await columnModel.update(columnId, {
      ...column,
      updatedAt: Date.now()
    })
  } catch (error) {
    throw error
  }
}

const deleteColumn = async (columnId) => {
  try {
    const targetColumn = await columnModel.find(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    await columnModel.deleteColumn(columnId)
    await cardModel.deleteCards(columnId)
    await commentModel.deleteComments('columnId', columnId)

    await boardModel.updateColumnOrderIds(targetColumn, '$pull')

    await CloudinaryProvider.deleteImages(
      `${env.PROJECT_NAME}/${
        env.CLOUDINARY_BOARDS_COLLECTION_NAME
      }/${targetColumn.boardId.toString()}/${
        env.CLOUDINARY_COLUMNS_COLLECTION_NAME
      }/${targetColumn._id.toString()}/`
    )
    await CloudinaryProvider.deleteFolder(
      `${env.PROJECT_NAME}/${
        env.CLOUDINARY_BOARDS_COLLECTION_NAME
      }/${targetColumn.boardId.toString()}/${
        env.CLOUDINARY_COLUMNS_COLLECTION_NAME
      }/${targetColumn._id.toString()}/`
    )

    return { result: 'Deleted' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  create,
  update,
  deleteColumn
}
