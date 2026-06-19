export const ROLES = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
};

export const ALL_ROLES = [ROLES.ADMIN, ROLES.OPERATOR];
export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
export const AUTH_STORAGE_KEY = "canteen-auth-user";
export const IDLE_FLAG_KEY = "canteen-auth-idle";
