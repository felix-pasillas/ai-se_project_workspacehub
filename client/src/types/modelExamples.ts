import type { Project, Task } from "./models";
import type { ProjectWithTaskCount } from "./views";

export const exampleProject: Project = {
  _id: "6650a1f2c3d4e5f6a7b8c9a1",
  organizationId: "6650a1f2c3d4e5f6a7b8c901",
  name: "Platform Refresh",
  description: "Revamp the internal platform dashboard and delivery flow.",
  createdBy: "6650a1f2c3d4e5f6a7b8c9c1",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-01T09:00:00.000Z",
};

export const exampleTask: Task = {
  _id: "6650a1f2c3d4e5f6a7b8c9b1",
  organizationId: exampleProject.organizationId,
  projectId: exampleProject._id,
  title: "Audit current navigation",
  description: "Document current IA issues and stale routes.",
  status: "todo",
  priority: "medium",
  assignedTo: "6650a1f2c3d4e5f6a7b8c9c3",
  dueDate: "2026-04-08T17:00:00.000Z",
  createdAt: "2026-04-02T10:30:00.000Z",
  updatedAt: "2026-04-02T10:30:00.000Z",
};

const exampleTasks: Task[] = [exampleTask];

export const exampleProjectWithTaskCount: ProjectWithTaskCount = {
  ...exampleProject,
  taskCount: exampleTasks.filter(
    (task) => task.projectId === exampleProject._id,
  ).length,
};
