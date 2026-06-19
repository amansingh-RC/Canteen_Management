import { mockRequest, ApiError } from "@/services/apiClient";
import { adminAccounts } from "@/data/admins";
import { ROLES } from "@/config/auth";

let accounts = adminAccounts.map((a) => ({ ...a }));

let counter = accounts.length;

/** Strip the password before a user object ever leaves this layer. */
function sanitize({ password, ...user }) {
  return user;
}

/** Authenticate by email + password. Resolves the user or rejects with ApiError. */
export function login({ email, password }) {
  return mockRequest(() => {
    const match = accounts.find(
      (a) => a.email.toLowerCase() === String(email).trim().toLowerCase()
    );
    if (!match || match.password !== password) {
      throw new ApiError("Invalid email or password", 401);
    }
    return sanitize(match);
  });
}

/** List all admin accounts (without passwords). */
export function listAdmins() {
  return mockRequest(() => accounts.map(sanitize));
}

/** Create a new admin account and return it (without password). */
export function addAdmin({ name, email, password, role }) {
  return mockRequest(() => {
    const exists = accounts.some(
      (a) => a.email.toLowerCase() === String(email).trim().toLowerCase()
    );
    if (exists) throw new ApiError("An admin with this email already exists", 409);

    counter += 1;
    const initials = name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const created = {
      id: `ADM${String(counter).padStart(3, "0")}`,
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      initials,
    };
    accounts = [...accounts, created];
    return sanitize(created);
  }, { latency: 400 });
}

/** Delete an admin account. Guards against removing the last Administrator. */
export function deleteAdmin(id) {
  return mockRequest(() => {
    const target = accounts.find((a) => a.id === id);
    if (!target) throw new ApiError("Admin not found", 404);

    const otherAdmins = accounts.filter((a) => a.id !== id && a.role === ROLES.ADMIN);
    if (target.role === ROLES.ADMIN && otherAdmins.length === 0) {
      throw new ApiError("Can't remove the last administrator", 409);
    }

    accounts = accounts.filter((a) => a.id !== id);
    return { ok: true, id, name: target.name };
  }, { latency: 300 });
}
