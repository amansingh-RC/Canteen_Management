import { apiRequest } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { getMealTimings } from "@/services/mealTimingService";
import { MEALS } from "@/config/meals";

const NAME_TO_KEY = {
  breakfast: "breakfast",
  lunch: "lunch",
  snack: "snack",
  snacks: "snack",
  dinner: "dinner",
};
const keyForName = (n = "") =>
  NAME_TO_KEY[String(n).toLowerCase()] ?? String(n).toLowerCase();

function unwrap(res) {
  return res?.data ?? res;
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function describeScope(filters = {}) {
  const parts = [];
  if (filters.from && filters.to)
    parts.push(`${formatDate(filters.from)} – ${formatDate(filters.to)}`);
  ["category", "meal"].forEach((k) => {
    if (filters[k] && filters[k] !== "All") parts.push(filters[k]);
  });
  return parts.length ? parts.join(" · ") : "All data";
}

// Columns the page/exporters render for each report.
const ATTENDANCE_COLUMNS = [
  { key: "employeeId", label: "Employee ID" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  ...MEALS.map((m) => ({ key: m.key, label: m.label })),
  { key: "total", label: "Total" },
];
const EXPIRED_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "meal", label: "Meal" },
  { key: "registered", label: "Registered" },
  { key: "verified", label: "Verified" },
  { key: "expired", label: "Expired" },
];

export async function getReports(filters = {}) {
  const { from, to, meal = "All", category = "All" } = filters;

  const [logsRaw, usersRaw, meals] = await Promise.all([
    apiRequest(ENDPOINTS.reportsMonthly, { query: { from, to } }).then(unwrap),
    apiRequest(ENDPOINTS.users).then(unwrap),
    getMealTimings(),
  ]);

  const users = Array.isArray(usersRaw) ? usersRaw : [];
  const userById = new Map(users.map((u) => [String(u.userId), u]));
  const registered = users.filter((u) => u.isActive !== false).length;

  const mealById = new Map(meals.map((m) => [String(m.mealId), m]));
  const mealFilterId =
    meal !== "All"
      ? meals.find((m) => keyForName(m.label) === keyForName(meal))?.mealId
      : null;

  const logs = (Array.isArray(logsRaw) ? logsRaw : []).filter(
    (l) =>
      (l.status ?? "ALLOWED") === "ALLOWED" &&
      (mealFilterId == null || l.mealId === mealFilterId),
  );

  const perUser = new Map();
  for (const log of logs) {
    const id = String(log.userId);
    if (!perUser.has(id)) {
      const u = userById.get(id);
      perUser.set(id, {
        employeeId: id,
        name: u?.name ?? id,
        category: u?.departmentName ?? u?.department ?? "—",
        breakfast: 0,
        lunch: 0,
        snack: 0,
        dinner: 0,
        total: 0,
      });
    }
    const row = perUser.get(id);
    const k = keyForName(mealById.get(String(log.mealId))?.label);
    if (k in row) row[k] += 1;
    row.total += 1;
  }
  let attendanceRows = [...perUser.values()];
  if (category !== "All")
    attendanceRows = attendanceRows.filter((r) => r.category === category);
  attendanceRows.sort((a, b) => b.total - a.total);

  const enabledMeals = meals.filter(
    (m) => m.enabled && (mealFilterId == null || m.mealId === mealFilterId),
  );
  const verifiedBySession = new Map();
  const operationalDates = new Set();
  for (const log of logs) {
    operationalDates.add(log.logDate);
    const key = `${log.logDate}|${log.mealId}`;
    if (!verifiedBySession.has(key)) verifiedBySession.set(key, new Set());
    verifiedBySession.get(key).add(String(log.userId));
  }

  const expiredRows = [];
  let expiredTotal = 0;

  for (const date of [...operationalDates].sort().reverse()) {
    for (const m of enabledMeals) {
      const verified = verifiedBySession.get(`${date}|${m.mealId}`)?.size ?? 0;
      const expired = Math.max(0, registered - verified);
      expiredTotal += expired;
      expiredRows.push({ date, meal: m.label, registered, verified, expired });
    }
  }

  return {
    scope: describeScope(filters),
    appliedFilters: filters,
    attendance: {
      key: "per-user-attendance",
      title: "Per-User Meal Attendance",
      description: "Per-user meal attendance across the selected range.",
      columns: ATTENDANCE_COLUMNS,
      rows: attendanceRows,
    },
    expired: {
      key: "expired-coupons",
      title: "Expired Coupons",
      description:
        "Unused (expired) coupons per session in the selected range.",
      columns: EXPIRED_COLUMNS,
      rows: expiredRows,
      total: expiredTotal,
    },
  };
}
