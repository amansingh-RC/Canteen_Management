import { apiRequest } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { getMealTimings, readMealTimings } from "@/services/mealTimingService";
import { decorateTimings, findActiveMeal } from "@/lib/mealStatus";
import { to12h, countdownTo } from "@/lib/liveTransform";
import { formatClock } from "@/lib/format";

/*
 * Dashboard data is keyed by mealId so each session shows ONLY its own data:
 *
 *   registered = userStats.totalActiveUsers      (device-registered users)
 *   verified   = distinct users who scanned for THAT meal today (/api/meallogs)
 *   pending    = registered − verified           (active session; decreases live)
 *   expired    = registered − verified           (shown once the session closes)
 *
 * /api/today's userStats is today-wide, so per-session counts come from the
 * meal logs grouped by mealId — that's what keeps sessions from mixing.
 */

function unwrap(res) {
  return res?.data ?? res;
}

function formatScanTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : formatClock(date);
}

/** A single verification log → live-feed row. */
function toFeedRow(log = {}, index, mealLabel) {
  const ok = log.status ? log.status === "ALLOWED" : true;
  return {
    id: log.logId ?? log.id ?? index,
    time: formatScanTime(log.createdAt ?? log.logTime),
    employeeId: log.userId ?? log.user?.userId ?? "",
    name: log.user?.name ?? log.name ?? "",
    meal: mealLabel,
    result: ok ? "verified" : "failed",
    resultLabel: ok ? "Verified" : "Failed",
  };
}

/**
 * Build the dashboard snapshot from today's stats + the meal logs.
 * Sessions are matched to logs by `mealId`.
 */
export function buildDashboardSnapshot(today, logs, now = new Date()) {
  const timings = decorateTimings(readMealTimings(), now);
  const activeMeal = findActiveMeal(timings, now);

  const registered = today?.userStats?.totalActiveUsers ?? 0;
  const todayDate = today?.date;

  // Keep only today's logs, grouped by mealId.
  const logsByMeal = new Map();
  for (const log of Array.isArray(logs) ? logs : []) {
    if (todayDate && log.logDate && log.logDate !== todayDate) continue;
    const k = String(log.mealId);
    if (!logsByMeal.has(k)) logsByMeal.set(k, []);
    logsByMeal.get(k).push(log);
  }

  // Distinct verified (ALLOWED) users for a meal.
  const verifiedFor = (mealId) => {
    const list = logsByMeal.get(String(mealId)) ?? [];
    const users = new Set();
    for (const l of list) {
      if ((l.status ?? "ALLOWED") === "ALLOWED") users.add(l.userId);
    }
    return users.size;
  };

  const sessions = timings.map((meal) => {
    const isActive = meal.status === "active";
    const isClosed = meal.status === "closed";
    const isOff = meal.status === "off";
    const isUpcoming = meal.status === "upcoming";

    const verified = isOff ? 0 : verifiedFor(meal.mealId);
    let pending = 0;
    let expired = 0;
    if (isActive) pending = Math.max(0, registered - verified);
    else if (isUpcoming) pending = registered;
    else if (isClosed) expired = Math.max(0, registered - verified);

    const verifiedPct = registered ? Math.round((verified / registered) * 100) : 0;

    let countdown = null;
    let countdownLabel = null;
    if (isActive) {
      countdown = countdownTo(meal.end, now);
      countdownLabel = "Window closes in";
    } else if (isUpcoming) {
      countdown = countdownTo(meal.start, now);
      countdownLabel = "Window opens in";
    }

    let detail;
    if (isOff) detail = "Meal disabled";
    else if (isActive) detail = `${verified} of ${registered} registered verified`;
    else if (isUpcoming) detail = `Opens in ${countdown}`;
    else detail = `${verified} verified · ${expired} expired`;

    // This session's own logs (most recent first) → feed.
    const feed = (logsByMeal.get(String(meal.mealId)) ?? [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((log, i) => toFeedRow(log, i, meal.label));

    return {
      key: meal.key,
      mealId: meal.mealId,
      meal: meal.label,
      status: meal.status,
      stateLabel: meal.statusLabel,
      statusLabel: isUpcoming ? `Upcoming ${meal.start}` : meal.statusLabel,
      window: `${to12h(meal.start)} – ${to12h(meal.end)}`,
      windowShort: `${meal.start}–${meal.end}`,
      countdown,
      countdownLabel,
      verified,
      pending,
      expired,
      progress: isActive || isClosed ? verifiedPct : null,
      detail,
      feed,
    };
  });

  return { activeMealKey: activeMeal?.key ?? sessions[0]?.key, sessions };
}

/** Fetch today's dashboard snapshot from the backend. */
export async function getDashboard() {
  const [today, logs] = await Promise.all([
    apiRequest(ENDPOINTS.today).then(unwrap),
    apiRequest(ENDPOINTS.mealLogs).then(unwrap),
    // Ensures the meal-timings cache (with mealId) is fresh for the snapshot.
    getMealTimings(),
  ]);
  return buildDashboardSnapshot(today, logs);
}
