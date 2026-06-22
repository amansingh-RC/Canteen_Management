import { apiRequest } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { readMealTimings } from "@/services/mealTimingService";
import { decorateTimings, findActiveMeal } from "@/lib/mealStatus";
import { to12h, countdownTo } from "@/lib/liveTransform";
import { formatClock } from "@/lib/format";

const NAME_TO_KEY = {
  breakfast: "breakfast",
  lunch: "lunch",
  snack: "snack",
  snacks: "snack",
  dinner: "dinner",
};

function keyForName(name = "") {
  const lower = String(name).trim().toLowerCase();
  return NAME_TO_KEY[lower] ?? lower.replace(/\s+/g, "-");
}

function unwrap(res) {
  return res?.data ?? res;
}

function formatScanTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : formatClock(date);
}

/** Map a backend recentScans row → live-feed row (best-effort across shapes). */
function toFeedRow(scan = {}, index, mealLabel) {
  const ok = scan.allowed !== false && scan.result !== "failed";
  return {
    id: scan.id ?? scan.logId ?? scan.scanId ?? index,
    time: formatScanTime(scan.timestamp ?? scan.scanTime ?? scan.createdAt ?? scan.time),
    employeeId: scan.userId ?? scan.employeeId ?? "",
    name: scan.name ?? scan.userName ?? "",
    meal: mealLabel,
    result: ok ? "verified" : "failed",
    resultLabel: ok ? "Verified" : "Failed",
  };
}

/** Build the dashboard snapshot the page renders from /api/today + meal timings. */
export function buildDashboardSnapshot(today, now = new Date()) {
  const timings = decorateTimings(readMealTimings(), now);
  const activeMeal = findActiveMeal(timings, now);

  const registered = today?.userStats?.totalActiveUsers ?? 0;
  const verifiedNow = today?.userStats?.usersFed ?? 0;

  // The session the backend is currently reporting on (active meal).
  const trackedKey = today?.currentMeal?.name
    ? keyForName(today.currentMeal.name)
    : activeMeal?.key ?? null;
  const recentScans = Array.isArray(today?.recentScans) ? today.recentScans : [];

  const sessions = timings.map((meal) => {
    const isTracked = meal.key === trackedKey;
    const isActive = meal.status === "active";
    const isOff = meal.status === "off";
    const isClosed = meal.status === "closed";

    // Real counts only for the tracked session; others have no data.
    const verified = isTracked ? verifiedNow : 0;
    const pending = isTracked && !isOff ? registered : 0;
    // Expired surfaces only after the window has closed.
    const expired = isTracked && isClosed ? Math.max(0, registered - verified) : 0;
    const verifiedPct = registered && isTracked ? Math.round((verified / registered) * 100) : 0;

    let countdown = null;
    let countdownLabel = null;
    if (meal.status === "active") {
      countdown = countdownTo(meal.end, now);
      countdownLabel = "Window closes in";
    } else if (meal.status === "upcoming") {
      countdown = countdownTo(meal.start, now);
      countdownLabel = "Window opens in";
    }

    let detail;
    if (isOff) detail = "Meal disabled";
    else if (isActive && isTracked) detail = `${verified} of ${registered} registered verified`;
    else if (meal.status === "upcoming") detail = `Opens in ${countdown}`;
    else if (isClosed && isTracked) detail = `${verified} verified · ${expired} expired`;
    else detail = meal.statusLabel;

    const feed = isTracked && isActive
      ? recentScans.map((scan, i) => toFeedRow(scan, i, meal.label))
      : [];

    return {
      key: meal.key,
      meal: meal.label,
      status: meal.status,
      stateLabel: meal.statusLabel,
      statusLabel: meal.status === "upcoming" ? `Upcoming ${meal.start}` : meal.statusLabel,
      window: `${to12h(meal.start)} – ${to12h(meal.end)}`,
      windowShort: `${meal.start}–${meal.end}`,
      countdown,
      countdownLabel,
      verified,
      pending,
      expired,
      progress: isActive && isTracked ? verifiedPct : null,
      detail,
      feed,
    };
  });

  return { activeMealKey: activeMeal?.key ?? sessions[0]?.key, sessions };
}

/** Fetch today's dashboard snapshot from the backend. */
export async function getDashboard() {
  const today = unwrap(await apiRequest(ENDPOINTS.today));
  return buildDashboardSnapshot(today);
}
