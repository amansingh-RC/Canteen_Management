export const ENDPOINTS = {
  // ── Auth ────────────────────────────────────────────────────────────────
  login: "/auth/login", // POST { email, password } → { token, admin }
  register: "/auth/register", // POST { username, email, password, roleId } → admin

  // ── Admins (Admin Management page) ──────────────────────────────────────
  admins: "/admins", // GET list
  admin: (id) => `/admins/${id}`, // PUT { email, roleId } · DELETE one

  // ── Users (User Management page) ────────────────────────────────────────
  users: "/users", // GET ?page&pageSize&search&category&status → paginated
  user: (id) => `/users/${id}`, // GET one (reserved for future use)

  // ── Analytics (User Detail page) ────────────────────────────────────────
  recentSearches: "/analytics/recent-searches", // GET recent lookups
  userDetail: "/analytics/user", // GET ?query&month → per-user detail

  // ── Reports ─────────────────────────────────────────────────────────────
  reports: "/reports", // POST filters → report metadata + history
  reportExport: "/reports/export", // POST { reportKey, format, filters } → { url }

  // ── Live Monitoring ─────────────────────────────────────────────────────
  liveMonitoring: "/live-monitoring", // GET current raw snapshot (then Socket.IO)

  // ── Meal Timings ────────────────────────────────────────────────────────
  mealTimings: "/meal-timings", // GET list · PATCH { changes } (diff only)
};
