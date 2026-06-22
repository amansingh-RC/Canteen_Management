export const ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",

  admins: "/admins",
  admin: (id) => `/admins/${id}`,

  users: "/users",
  user: (id) => `/users/${id}`,

  recentSearches: "/analytics/recent-searches",
  userDetail: "/analytics/user",

  reports: "/reports",
  reportExport: "/reports/export",

  liveMonitoring: "/live-monitoring",

  // Dashboard: today's session stats (registered / fed / pending + currentMeal)
  today: "/today",

  meals: "/meals",
  meal: (id) => `/meals/${id}`,
};
