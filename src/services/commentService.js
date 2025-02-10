import { cardModel } from '~/models/cardModel'
import { commentModel } from '~/models/commentModel'

const create = async (comment) => {
  try {
    const newComment = await commentModel.find(
      (
        await commentModel.create({
          ...comment
        })
      ).insertedId
    )

    if (newComment) {
      await cardModel.updateCommentIds(newComment, '$push')
    }
    return newComment
  } catch (error) {
    throw error
  }
}

const update = async (comment) => {
  try {
    const existedComment = await commentModel.find(comment._id)

    if (!existedComment) throw new Error('Comment not found')

    if (comment.content !== existedComment.content) {
      return await commentModel.update(comment._id, comment)
    }
  } catch (error) {
    throw error
  }
}

const deleteComment = async (commentId) => {
  try {
    const existedComment = await commentModel.find(commentId)
    if (!existedComment) throw new Error('Comment not found')

    return await commentModel.deleteComment(commentId)
  } catch (error) {
    throw error
  }
}

export const commentService = {
  create,
  deleteComment,
  update
}
