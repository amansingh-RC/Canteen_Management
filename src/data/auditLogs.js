export const auditLogs = [
  { id: 1, timestamp: "12 Jun 01:12 PM", user: "Aman Singh", role: "Admin", action: "Edited meal timing — Lunch", module: "Meal Timings" },
  { id: 2, timestamp: "12 Jun 12:48 PM", user: "Priya Nair", role: "Manager", action: "Exported Attendance Report (PDF)", module: "Reports" },
  { id: 3, timestamp: "12 Jun 11:30 AM", user: "Operator 03", role: "Operator", action: "Reset face data — EMP1188", module: "User Mgmt" },
  { id: 4, timestamp: "12 Jun 09:05 AM", user: "Aman Singh", role: "Admin", action: "Bulk imported 498 users", module: "Bulk Upload" },
  { id: 5, timestamp: "12 Jun 08:00 AM", user: "System", role: "System", action: "Opened daily meal verification windows", module: "Scheduler" },
  { id: 6, timestamp: "11 Jun 06:15 PM", user: "Priya Nair", role: "Manager", action: "Disabled user — EMP1099", module: "User Mgmt" },
  { id: 7, timestamp: "11 Jun 02:40 PM", user: "Aman Singh", role: "Admin", action: "Updated confidence threshold to 85%", module: "Settings" },
];

export const ROLE_VARIANT = {
  Admin: "info",
  Manager: "secondary",
  Operator: "warning",
  System: "secondary",
};
