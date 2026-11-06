import { Comment } from "../models/Comment";
import type { AuthPayload } from "../types/domain";
import { AppError } from "../utils/appError";
import { assertFound } from "../utils/scopedQuery";
import { requireString } from "../utils/validators";
import { canManageComment } from "./permissionService";
import { getTaskById } from "./taskService";

export const listComments = async (organizationId: string, taskId: string) => {
  await getTaskById(organizationId, taskId);
  return Comment.find({ organizationId, taskId }).sort({ createdAt: -1 });
};

export const getCommentById = async (
  organizationId: string,
  taskId: string,
  commentId: string,
) => {
  const comment = await Comment.findOne({
    _id: commentId,
    organizationId,
    taskId,
  });
  return assertFound(comment, "Comment");
};

export const createComment = async (
  actor: AuthPayload,
  taskId: string,
  payload: Record<string, unknown>,
) => {
  const content = requireString(payload.content, "Content");

  await getTaskById(actor.organizationId, taskId);

  return Comment.create({
    organizationId: actor.organizationId,
    taskId,
    authorId: actor.userId,
    content,
  });
};

export const updateComment = async (
  actor: AuthPayload,
  taskId: string,
  commentId: string,
  payload: Record<string, unknown>,
) => {
  const comment = await getCommentById(actor.organizationId, taskId, commentId);

  if (!canManageComment(actor, String(comment.authorId))) {
    throw new AppError(
      "You do not have permission to update this comment",
      403,
    );
  }

  comment.content = requireString(payload.content, "Content");

  await comment.save();
  return comment;
};

export const deleteComment = async (
  actor: AuthPayload,
  taskId: string,
  commentId: string,
) => {
  const comment = await getCommentById(actor.organizationId, taskId, commentId);

  if (!canManageComment(actor, String(comment.authorId))) {
    throw new AppError(
      "You do not have permission to delete this comment",
      403,
    );
  }

  await comment.deleteOne();
  return { deleted: true };
};
