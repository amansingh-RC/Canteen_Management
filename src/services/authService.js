import { mockRequest, ApiError } from "@/services/apiClient";
import { adminAccounts } from "@/data/admins";

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
