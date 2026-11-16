import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { commentService } from "../services/commentService";
import type { Comment, User } from "../types/models";
import { canManageComment } from "../utils/permissions";

interface TaskCommentsProps {
  taskId: string;
  users: User[];
  commentCount: number;
}

export const TaskComments = ({
  taskId,
  users,
  commentCount,
}: TaskCommentsProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [pendingCommentId, setPendingCommentId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const displayedCount = hasLoaded ? comments.length : commentCount;

  const getAuthorName = (authorId: string) => {
    const author = users.find((candidate) => candidate._id === authorId);
    return author ? `${author.firstName} ${author.lastName}` : "Unknown user";
  };

  const loadComments = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextComments = await commentService.list(taskId);
      setComments(nextComments);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load comments",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const nextIsExpanded = !isExpanded;
    setIsExpanded(nextIsExpanded);

    if (nextIsExpanded && !hasLoaded && !isLoading) {
      void loadComments();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdComment = await commentService.create(taskId, {
        content: trimmedContent,
      });
      setComments((current) => [createdComment, ...current]);
      setContent("");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to add comment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
    setActionError(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
    setActionError(null);
  };

  const handleSaveEdit = async (commentId: string) => {
    const trimmedContent = editingContent.trim();

    if (!trimmedContent) {
      return;
    }

    setPendingCommentId(commentId);
    setActionError(null);

    try {
      const updatedComment = await commentService.update(taskId, commentId, {
        content: trimmedContent,
      });
      setComments((current) =>
        current.map((comment) =>
          comment._id === commentId ? updatedComment : comment,
        ),
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to update comment",
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    setPendingCommentId(commentId);
    setActionError(null);

    try {
      await commentService.delete(taskId, commentId);
      setComments((current) =>
        current.filter((comment) => comment._id !== commentId),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to delete comment",
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  return (
    <>
      <button
        className="ml-auto rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70"
        onClick={handleToggle}
        type="button"
      >
        {isExpanded ? "Hide Comments" : `Show Comments (${displayedCount})`}
      </button>
      {isExpanded ? (
        <div className="mt-4 basis-full space-y-4 rounded-2xl border border-slate-200 p-4">
          <form
            className="space-y-3"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <textarea
              className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 transition placeholder:text-[#94A3B880] hover:border-slate-300"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write a comment"
              value={content}
            />
            {submitError ? (
              <p className="text-sm text-danger">{submitError}</p>
            ) : null}
            <button
              className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!content.trim() || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Adding..." : "Add comment"}
            </button>
          </form>
          {isLoading ? (
            <p className="text-sm text-slate-600">Loading comments...</p>
          ) : null}
          {loadError ? (
            <p className="text-sm text-danger">{loadError}</p>
          ) : null}
          {actionError ? (
            <p className="text-sm text-danger">{actionError}</p>
          ) : null}
          {hasLoaded && !comments.length ? (
            <p className="text-sm text-slate-600">No comments yet.</p>
          ) : null}
          {comments.length ? (
            <ul className="space-y-3">
              {comments.map((comment) => {
                const isEditing = editingCommentId === comment._id;
                const isPending = pendingCommentId === comment._id;

                return (
                  <li
                    className="rounded-2xl bg-slate-50 px-4 py-3"
                    key={comment._id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink">
                        {getAuthorName(comment.authorId)}
                      </p>
                      {canManageComment(user, comment) && !isEditing ? (
                        <div className="flex flex-col items-stretch gap-1">
                          <button
                            className="rounded-[10px] bg-ink px-3 py-1 text-xs font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isPending}
                            onClick={() => handleStartEdit(comment)}
                            type="button"
                          >
                            Update
                          </button>
                          <button
                            className="rounded-[10px] px-3 py-1 text-xs font-medium text-danger transition hover:bg-rose-50 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isPending}
                            onClick={() => void handleDelete(comment._id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <input
                          aria-label="Edit comment"
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition hover:border-slate-300"
                          onChange={(event) =>
                            setEditingContent(event.target.value)
                          }
                          value={editingContent}
                        />
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!editingContent.trim() || isPending}
                            onClick={() => void handleSaveEdit(comment._id)}
                            type="button"
                          >
                            {isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="rounded-[10px] px-4 py-2 text-sm font-normal text-slate-600 transition hover:bg-slate-100 active:opacity-70"
                            onClick={handleCancelEdit}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">
                        {comment.content}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
