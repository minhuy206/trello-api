import { commentRepository } from './comment.repo'
import { cardRepository } from '../cards/card.repo'
import CustomAPIError from '~/utils/CustomAPIError'
import { StatusCodes } from 'http-status-codes'
import { CommentSchema } from './comment.model'
import { validateBody } from '~/utils/formatter'

const create = async (userId, body) => {
  try {
    const targetCard = await cardRepository.find({
      _id: body.cardId
    })

    if (!targetCard)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Card not found'
      )

    const newComment = await commentRepository.find({
      _id: (
        await commentRepository.create(
          await validateBody(CommentSchema, {
            ...body,
            columnId: targetCard.columnId.toString(),
            boardId: targetCard.boardId.toString(),
            createdById: userId
          })
        )
      ).insertedId
    })

    if (newComment) {
      await cardRepository.updateCommentOrderIds(newComment, '$push')
    }
    return newComment
  } catch (error) {
    throw error
  }
}

const update = async (commnetId, body) => {
  try {
    const existedComment = await commentRepository.find({ _id: commnetId })

    if (!existedComment)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Comment not found'
      )

    if (body.content !== existedComment.content) {
      return commentRepository.update(
        {
          _id: commnetId
        },
        body
      )
    }
  } catch (error) {
    throw error
  }
}

const deleteComment = async (userId, commentId) => {
  try {
    const existedComment = await commentRepository.find({ _id: commentId })
    if (!existedComment)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Comment not found'
      )
    if (!existedComment.createdById.equals(userId))
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'You are not authorized to delete this comment'
      )

    return commentRepository.deleteComment({ userId, commentId })
  } catch (error) {
    throw error
  }
}

export const commentService = {
  create,
  deleteComment,
  update
}
