import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Comment, User } from "../types/models";

interface TaskCommentsProps {
  taskId: string;
  users: User[];
}

export const TaskComments = ({ taskId, users }: TaskCommentsProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<Comment[]>(() => [
    {
      _id: "mock-comment-2",
      organizationId: user?.organizationId ?? "",
      taskId,
      authorId: users[0]?._id ?? "",
      content: "This is a mock comment from an existing user.",
      createdAt: "2026-03-06T12:00:00.000Z",
      updatedAt: "2026-03-06T12:00:00.000Z",
    },
    {
      _id: "mock-comment-1",
      organizationId: user?.organizationId ?? "",
      taskId,
      authorId: "deleted-user",
      content: "This is a mock comment from a deleted user.",
      createdAt: "2026-03-05T12:00:00.000Z",
      updatedAt: "2026-03-05T12:00:00.000Z",
    },
  ]);

  const getAuthorName = (authorId: string) => {
    const author = users.find((candidate) => candidate._id === authorId);
    return author ? `${author.firstName} ${author.lastName}` : "Unknown user";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    const timestamp = new Date().toISOString();
    const newComment: Comment = {
      _id: `mock-comment-${Date.now()}`,
      organizationId: user?.organizationId ?? "",
      taskId,
      authorId: user?._id ?? "",
      content: trimmedContent,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setComments((current) => [newComment, ...current]);
    setContent("");
  };

  return (
    <>
      <button
        className="ml-auto rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        {isExpanded ? "Hide Comments" : `Show Comments (${comments.length})`}
      </button>
      {isExpanded ? (
        <div className="mt-4 basis-full space-y-4 rounded-2xl border border-slate-200 p-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 transition placeholder:text-[#94A3B880] hover:border-slate-300"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write a comment"
              value={content}
            />
            <button
              className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!content.trim()}
              type="submit"
            >
              Add comment
            </button>
          </form>
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li
                className="rounded-2xl bg-slate-50 px-4 py-3"
                key={comment._id}
              >
                <p className="text-sm font-medium text-ink">
                  {getAuthorName(comment.authorId)}
                </p>
                <p className="mt-1 text-sm text-slate-600">{comment.content}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
};
