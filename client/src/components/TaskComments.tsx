import { useState, type FormEvent } from "react";
import { commentService } from "../services/commentService";
import type { Comment, User } from "../types/models";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
          {hasLoaded && !comments.length ? (
            <p className="text-sm text-slate-600">No comments yet.</p>
          ) : null}
          {comments.length ? (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li
                  className="rounded-2xl bg-slate-50 px-4 py-3"
                  key={comment._id}
                >
                  <p className="text-sm font-medium text-ink">
                    {getAuthorName(comment.authorId)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {comment.content}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
