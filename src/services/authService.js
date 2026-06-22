import { apiRequest, setAuthToken } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { ROLES } from "@/config/auth";

const ROLE_TO_ID = { [ROLES.ADMIN]: 1, [ROLES.OPERATOR]: 2 };
const ID_TO_ROLE = { 1: ROLES.ADMIN, 2: ROLES.OPERATOR };
const NAME_TO_ROLE = { admin: ROLES.ADMIN, operator: ROLES.OPERATOR };

function roleIdFor(label) {
  return ROLE_TO_ID[label] ?? ROLE_TO_ID[ROLES.OPERATOR];
}

function roleLabelFor(raw) {
  if (raw == null) return ROLES.OPERATOR;
  if (typeof raw === "number") return ID_TO_ROLE[raw] ?? ROLES.OPERATOR; 
  if (typeof raw === "object") return NAME_TO_ROLE[raw.roleName?.toLowerCase()] ?? ROLES.OPERATOR;
  return NAME_TO_ROLE[String(raw).toLowerCase()] ?? ROLES.OPERATOR;
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

function unwrap(res) {
  return res?.data ?? res;
}
export async function login({ email, password }) {
  const data = unwrap(
    await apiRequest(ENDPOINTS.login, { method: "POST", body: { email, password } })
  );
  if (data?.token) setAuthToken(data.token);
  const admin = data.admin ?? data;
  return normalizeAdmin({ ...admin, email: admin.email ?? email });
}

export async function register({ name, email, password, role }) {
  const data = unwrap(
    await apiRequest(ENDPOINTS.register, {
      method: "POST",
      body: { username: name, email, password, roleId: roleIdFor(role) },
    })
  );
  return normalizeAdmin(data);
}

export const addAdmin = register;
export async function listAdmins() {
  const data = unwrap(await apiRequest(ENDPOINTS.admins));
  return Array.isArray(data) ? data.map(normalizeAdmin) : [];
}

export async function updateAdmin(id, { email, role } = {}) {
  const body = {};
  if (email !== undefined) body.email = email;
  if (role !== undefined) body.roleId = roleIdFor(role);
  const data = unwrap(await apiRequest(ENDPOINTS.admin(id), { method: "PUT", body }));
  return normalizeAdmin(data);
}
export async function deleteAdmin(id) {
  await apiRequest(ENDPOINTS.admin(id), { method: "DELETE" });
  return { ok: true, id };
}
