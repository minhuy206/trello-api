import { commentRepository } from './comment.repo'
import { cardRepository } from '../cards/card.repo'
import CustomAPIError from '~/utils/CustomAPIError'
import { StatusCodes } from 'http-status-codes'
import { CommentSchema } from './comment.model'
import { validateBody } from '~/utils/helper'

const create = async (body) => {
  try {
    const newComment = await commentRepository.find(
      (
        await commentRepository.create(validateBody(CommentSchema, body))
      ).insertedId
    )

    if (newComment) {
      await cardRepository.updateCommentOrderIds(newComment, '$push')
    }
    return newComment
  } catch (error) {
    throw error
  }
}

const update = async (comment) => {
  try {
    const existedComment = await commentRepository.find(comment._id)

    if (!existedComment)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Comment not found'
      )

    if (comment.content !== existedComment.content) {
      return await commentRepository.update(comment._id, comment)
    }
  } catch (error) {
    throw error
  }
}

const deleteComment = async (commentId) => {
  try {
    const existedComment = await commentRepository.find(commentId)
    if (!existedComment)
      throw new CustomAPIError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Comment not found'
      )

    return await commentRepository.deleteComment(commentId)
  } catch (error) {
    throw error
  }
}

export const commentService = {
  create,
  deleteComment,
  update
}
