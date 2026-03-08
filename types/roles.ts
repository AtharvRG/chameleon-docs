// types/roles.ts

export type Role = "viewer" | "editor" | "admin";

export const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
};