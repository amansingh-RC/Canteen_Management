/**
 * Central registry of ALL backend API routes.
 *
 * One place for every backend path, so wiring the real backend = editing this
 * file (+ flipping VITE_USE_MOCK in .env). Paths are appended to
 * VITE_API_BASE_URL (see src/services/apiClient.js).
 *
 * Why paths live here and NOT in .env: .env holds environment-specific values
 * (the host/origin, the mock toggle) that change per machine/deploy. Route
 * paths are the SAME across every environment, so they belong in code where
 * they can be imported and refactored safely. The "centralised" config you
 * wanted is: base URL → .env, all routes → this file.
 *
 * Functions are used for routes that need an id/param.
 * Real-time updates are NOT here — those flow over Socket.IO
 * (src/services/socketClient.js, configured via VITE_SOCKET_URL).
 */
export const ENDPOINTS = {
  // ── Auth ────────────────────────────────────────────────────────────────
  login: "/auth/login", // POST { email, password } → user (+ token)

  // ── Admins (Admin Management page) ──────────────────────────────────────
  admins: "/admins", // GET list · POST create { name, email, password, role }
  admin: (id) => `/admins/${id}`, // DELETE one

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
