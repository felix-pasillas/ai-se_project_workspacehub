import { describe, expect, it } from "vitest";
import type { User, UserRole } from "../types/models";
import { canCreateProject, isPrivilegedRole } from "./permissions";

const buildUser = (role: UserRole): User => ({
  _id: "user-1",
  firstName: "Test",
  lastName: "User",
  email: "test@workspacehub.dev",
  organizationId: "org-1",
  role,
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-01T09:00:00.000Z",
});

describe("isPrivilegedRole", () => {
  it("returns true for owner", () => {
    expect(isPrivilegedRole("owner")).toBe(true);
  });

  it("returns true for admin", () => {
    expect(isPrivilegedRole("admin")).toBe(true);
  });

  it("returns false for member", () => {
    expect(isPrivilegedRole("member")).toBe(false);
  });

  it("returns false for a missing role", () => {
    expect(isPrivilegedRole(null)).toBe(false);
    expect(isPrivilegedRole(undefined)).toBe(false);
  });
});

describe("canCreateProject", () => {
  it("allows an owner", () => {
    expect(canCreateProject(buildUser("owner"))).toBe(true);
  });

  it("allows an admin", () => {
    expect(canCreateProject(buildUser("admin"))).toBe(true);
  });

  it("denies a member", () => {
    expect(canCreateProject(buildUser("member"))).toBe(false);
  });

  it("denies a missing user", () => {
    expect(canCreateProject(null)).toBe(false);
  });
});
