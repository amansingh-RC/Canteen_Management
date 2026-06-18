/**
 * Meal definitions shared across the app (timings, coupons, reports, dashboard).
 * Keep meal metadata here so adding/removing a meal type is a one-place change.
 */
export const MEALS = [
  { key: "breakfast", label: "Breakfast", prefix: "BK", icon: "🍳", color: "var(--info)" },
  { key: "lunch", label: "Lunch", prefix: "LU", icon: "🍽️", color: "var(--success)" },
  { key: "snack", label: "Evening Snack", prefix: "EV", icon: "☕", color: "var(--warning)" },
  { key: "dinner", label: "Dinner", prefix: "DI", icon: "🌙", color: "#8b5cf6" },
];

/** Status vocabulary used by coupons + verifications (maps to Badge variants). */
export const STATUS_VARIANT = {
  used: "success",
  verified: "success",
  successful: "success",
  active: "success",
  unused: "warning",
  pending: "warning",
  retry: "warning",
  upcoming: "info",
  expired: "danger",
  failed: "danger",
  disabled: "danger",
  closed: "secondary",
};

export const USER_CATEGORIES = ["Dormitory", "OT"];

// export const DEPARTMENTS = [
//   "Production",
//   "Packaging",
//   "Admin",
//   "QA",
//   "Logistics",
// ];
