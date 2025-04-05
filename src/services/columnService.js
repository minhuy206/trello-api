import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { commentModel } from '~/models/commentModel'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import CustomAPIError from '~/utils/CustomAPIError'

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
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    const [, ,] = await Promise.all([
      columnModel.deleteColumn(columnId),
      cardModel.deleteCards(columnId),
      commentModel.deleteComments('columnId', columnId),

      boardModel.updateColumnOrderIds(targetColumn, '$pull'),

      CloudinaryProvider.deleteImages(
        `${env.PROJECT_NAME}/${
          env.CLOUDINARY_BOARDS_COLLECTION_NAME
        }/${targetColumn.boardId.toString()}/${
          env.CLOUDINARY_COLUMNS_COLLECTION_NAME
        }/${targetColumn._id.toString()}/`
      ),
      CloudinaryProvider.deleteFolder(
        `${env.PROJECT_NAME}/${
          env.CLOUDINARY_BOARDS_COLLECTION_NAME
        }/${targetColumn.boardId.toString()}/${
          env.CLOUDINARY_COLUMNS_COLLECTION_NAME
        }/${targetColumn._id.toString()}/`
      )
    ])

    return { result: 'Deleted successfully' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  create,
  update,
  deleteColumn
}
