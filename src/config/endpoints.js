export const ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",

  admins: "/admins",
  admin: (id) => `/admins/${id}`,

  users: "/users",
  user: (id) => `/users/${id}`,
  userAnalytics: (id) => `/users/${id}/analytics`,

  reports: "/reports",
  reportExport: "/reports/export",

  liveMonitoring: "/live-monitoring",

  today: "/today",
  mealLogs: "/meallogs",

  meals: "/meals",
  meal: (id) => `/meals/${id}`,
};
