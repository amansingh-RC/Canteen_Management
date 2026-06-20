import { apiRequest, setAuthToken } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { ROLES } from "@/config/auth";

const ROLE_TO_ID = { [ROLES.ADMIN]: 1, [ROLES.OPERATOR]: 2 };
const ID_TO_ROLE = { 1: ROLES.ADMIN, 2: ROLES.OPERATOR };
// Backend role name → frontend label
const NAME_TO_ROLE = { admin: ROLES.ADMIN, operator: ROLES.OPERATOR };

function roleIdFor(label) {
  return ROLE_TO_ID[label] ?? ROLE_TO_ID[ROLES.OPERATOR];
}

/** Resolve a frontend role label from any backend role representation. */
function roleLabelFor(raw) {
  if (raw == null) return ROLES.OPERATOR;
  if (typeof raw === "number") return ID_TO_ROLE[raw] ?? ROLES.OPERATOR; // roleId
  if (typeof raw === "object") return NAME_TO_ROLE[raw.roleName?.toLowerCase()] ?? ROLES.OPERATOR;
  return NAME_TO_ROLE[String(raw).toLowerCase()] ?? ROLES.OPERATOR; // "admin"/"operator"
}

function initialsOf(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Normalize a backend admin (login / register / list shapes) → app shape. */
function normalizeAdmin(raw = {}) {
  const name = raw.username ?? raw.name ?? "";
  return {
    id: raw.id,
    name,
    email: raw.email ?? "",
    role: roleLabelFor(raw.role ?? raw.roleId),
    initials: initialsOf(name),
  };
}

/** Unwrap the { success, data } envelope. */
function unwrap(res) {
  return res?.data ?? res;
}

/** Authenticate by email + password. Stores the token; returns the user. */
export async function login({ email, password }) {
  const data = unwrap(
    await apiRequest(ENDPOINTS.login, { method: "POST", body: { email, password } })
  );
  if (data?.token) setAuthToken(data.token);
  // The login payload's admin object omits email — fill it from what was typed.
  const admin = data.admin ?? data;
  return normalizeAdmin({ ...admin, email: admin.email ?? email });
}

/** Register (create) a new admin account. */
export async function register({ name, email, password, role }) {
  const data = unwrap(
    await apiRequest(ENDPOINTS.register, {
      method: "POST",
      body: { username: name, email, password, roleId: roleIdFor(role) },
    })
  );
  return normalizeAdmin(data);
}

// The Admin Management page calls this to create an admin.
export const addAdmin = register;

/** List all admin accounts. */
export async function listAdmins() {
  const data = unwrap(await apiRequest(ENDPOINTS.admins));
  return Array.isArray(data) ? data.map(normalizeAdmin) : [];
}

/** Update an admin's email and/or role. Only changed fields are sent. */
export async function updateAdmin(id, { email, role } = {}) {
  const body = {};
  if (email !== undefined) body.email = email;
  if (role !== undefined) body.roleId = roleIdFor(role);
  const data = unwrap(await apiRequest(ENDPOINTS.admin(id), { method: "PUT", body }));
  return normalizeAdmin(data);
}

/** Delete an admin account. */
export async function deleteAdmin(id) {
  await apiRequest(ENDPOINTS.admin(id), { method: "DELETE" });
  return { ok: true, id };
}
