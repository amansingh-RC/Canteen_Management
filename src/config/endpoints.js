export const ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",

  admins: "/admins",
  admin: (id) => `/admins/${id}`,

  users: "/users",
  user: (id) => `/users/${id}`,
  userAnalytics: (id) => `/users/${id}/analytics`,
  
  reportsMonthly: "/reports/monthly",
  reportsDuplicates: "/reports/duplicates",

  liveMonitoring: "/live-monitoring",

  today: "/today",
  mealLogs: "/meallogs",

  meals: "/meals",
  meal: (id) => `/meals/${id}`,
};
