import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { columnRepository } from './column.repo'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import CustomAPIError from '~/utils/CustomAPIError'
import { boardRepository } from '../boards/board.repo'
import { cardRepository } from '../cards/card.repo'
import { commentRepository } from '../comments/comment.repo'
import { ColumnSchema } from './column.model'
import { validateBody } from '~/utils/formatter'

const create = async (userId, body) => {
  try {
    const targetBoard = await boardRepository.find({ _id: body.boardId })
    if (!targetBoard) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    const newColumn = await columnRepository.find({
      _id: (
        await columnRepository.create(
          await validateBody(ColumnSchema, { ...body, createdById: userId })
        )
      ).insertedId
    })

    if (newColumn) {
      newColumn.cards = []
      await boardRepository.updateColumnOrderIds(newColumn, '$push')
    }

    return newColumn
  } catch (error) {
    throw error
  }
}

const getColumn = async (userId, columnId) => {
  try {
    const column = await columnRepository.getColumnIncludeCards(
      userId,
      columnId
    )

    if (!column) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    const resColumn = { ...column }
    resColumn.cards.forEach((card) => {
      card.comments = card.commentOrderIds.map((commentId) =>
        resColumn.comments.find((comment) => commentId.equal(comment._id))
      )
    })
    delete resColumn.comments
    return resColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, column) => {
  try {
    const targetColumn = await columnRepository.find({ _id: columnId })
    if (!targetColumn) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    return columnRepository.update(columnId, {
      ...column,
      updatedAt: Date.now()
    })
  } catch (error) {
    throw error
  }
}

const deleteColumn = async (columnId) => {
  try {
    const targetColumn = await columnRepository.find({ _id: columnId })
    if (!targetColumn) {
      throw new CustomAPIError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    const [, ,] = await Promise.all([
      columnRepository.deleteColumn(columnId),
      cardRepository.deleteCards(columnId),
      commentRepository.deleteComments({ columnId }),
      boardRepository.updateColumnOrderIds(targetColumn, '$pull'),
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

    return { message: 'Column deleted successfully' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  create,
  update,
  deleteColumn,
  getColumn
}
