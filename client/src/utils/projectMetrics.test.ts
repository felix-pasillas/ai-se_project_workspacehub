import { describe, expect, it } from "vitest";
import type { Project, Task } from "../types/models";
import { buildProjectWithTaskCount } from "./projectMetrics";

const buildProject = (id: string): Project => ({
  _id: id,
  organizationId: "org-1",
  name: `Project ${id}`,
  description: "A test project.",
  createdBy: "user-1",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-01T09:00:00.000Z",
});

const buildTask = (id: string, projectId: string): Task => ({
  _id: id,
  organizationId: "org-1",
  projectId,
  title: `Task ${id}`,
  description: "A test task.",
  status: "todo",
  priority: "medium",
  assignedTo: null,
  dueDate: null,
  createdAt: "2026-04-02T10:00:00.000Z",
  updatedAt: "2026-04-02T10:00:00.000Z",
});

describe("buildProjectWithTaskCount", () => {
  it("returns a count of 0 when there are no tasks", () => {
    const project = buildProject("p1");

    const result = buildProjectWithTaskCount(project, []);

    expect(result.taskCount).toBe(0);
  });

  it("counts only tasks that belong to the project", () => {
    const project = buildProject("p1");
    const tasks = [
      buildTask("t1", "p1"),
      buildTask("t2", "p1"),
      buildTask("t3", "p2"),
    ];

    const result = buildProjectWithTaskCount(project, tasks);

    expect(result.taskCount).toBe(2);
  });

  it("returns a count of 0 when every task belongs to a different project", () => {
    const project = buildProject("p1");
    const tasks = [buildTask("t1", "p2"), buildTask("t2", "p3")];

    const result = buildProjectWithTaskCount(project, tasks);

    expect(result.taskCount).toBe(0);
  });

  it("keeps every field of the original project", () => {
    const project = buildProject("p1");

    const result = buildProjectWithTaskCount(project, [buildTask("t1", "p1")]);

    expect(result).toEqual({ ...project, taskCount: 1 });
  });
});
