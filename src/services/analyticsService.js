import { apiRequest } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { MEALS } from "@/config/meals";

/*
 * User Detail Analytics is integrated with the REAL backend:
 *   GET /api/users/:id/analytics?year&month  →  { today, month, daily }
 *     month = { MealName: daysAttended }
 *     daily = { "YYYY-MM-DD": { MealName: attended? } }   (attended days only)
 * Profile (name/category) isn't in that payload, so we join /api/users.
 */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Backend meal name → frontend meal key (config/meals).
const NAME_TO_KEY = {
  breakfast: "breakfast",
  lunch: "lunch",
  snack: "snack",
  snacks: "snack",
  dinner: "dinner",
};

const pad = (n) => String(n).padStart(2, "0");

function keyForMeal(name = "") {
  const lower = String(name).trim().toLowerCase();
  return NAME_TO_KEY[lower] ?? lower;
}

function initialsOf(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function unwrap(res) {
  return res?.data ?? res;
}

/** Map the backend analytics payload (+ user) → the page's data shape. */
function buildUserAnalytics(analytics, user, userId, year, month) {
  const monthCounts = analytics?.month ?? {};
  const daily = analytics?.daily ?? {};

  const daysInMonth = new Date(year, month, 0).getDate();
  // Monday-first weekday index of the 1st (0 = Monday … 6 = Sunday).
  const startDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  // Per-meal day counts → breakdown bars (normalize backend names to keys).
  const daysByKey = {};
  for (const [name, count] of Object.entries(monthCounts)) {
    daysByKey[keyForMeal(name)] = count;
  }
  const mealBreakdown = MEALS.map((m) => {
    const days = daysByKey[m.key] ?? 0;
    return {
      key: m.key,
      meal: m.label,
      color: m.color,
      days,
      percent: daysInMonth ? Math.round((days / daysInMonth) * 100) : 0,
    };
  });

  // Walk every day of the month; `daily` only holds days with attendance.
  const calendarDays = [];
  let attended = 0;
  let offered = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateStr = `${year}-${pad(month)}-${pad(day)}`;
    const record = daily[dateStr];
    if (record) {
      const attendedMeals = [];
      for (const [name, did] of Object.entries(record)) {
        offered += 1;
        if (did) {
          attended += 1;
          attendedMeals.push(keyForMeal(name));
        }
      }
      calendarDays.push({
        day,
        attendedMeals,
        missed: attendedMeals.length === 0,
        status: attendedMeals.length ? "attended" : "missed",
      });
    } else {
      calendarDays.push({ day, attendedMeals: [], missed: false, status: "none" });
    }
  }

  const missed = Math.max(0, offered - attended);
  const attendance = offered ? Math.round((attended / offered) * 100) : 0;
  const name = user?.name ?? String(userId);

  return {
    query: userId,
    profile: {
      name,
      employeeId: user?.userId ?? userId,
      category: user?.department ?? "—",
      initials: initialsOf(name),
      attendance,
    },
    mealSummary: { offered, attended, missed },
    mealBreakdown,
    calendarDays,
    startDow,
    month: { key: `${year}-${pad(month)}`, label: `${MONTH_NAMES[month - 1]} ${year}` },
  };
}

/**
 * Fetch a user's monthly meal-attendance analytics.
 * @param {string} query    the employee/user id
 * @param {string} monthKey "YYYY-MM"
 */
export async function getUserDetail(query, monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);
  const [analytics, users] = await Promise.all([
    apiRequest(ENDPOINTS.userAnalytics(query), { query: { year, month } }).then(unwrap),
    apiRequest(ENDPOINTS.users).then(unwrap),
  ]);
  const user = (Array.isArray(users) ? users : []).find(
    (u) => String(u.userId) === String(query)
  );
  return buildUserAnalytics(analytics, user, query, year, month);
}
