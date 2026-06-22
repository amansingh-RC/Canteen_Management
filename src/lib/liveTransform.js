import { decorateTimings, findActiveMeal } from "@/lib/mealStatus";
import { readMealTimings } from "@/services/mealTimingService";
import { ratio, formatClock } from "@/lib/format";

/** "06:00" → "06:00 AM" */
export function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
}

export function countdownTo(hhmm, now) {
  const [h, m] = hhmm.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  let diff = Math.max(0, Math.floor((target - now) / 1000));
  const pad = (n) => String(n).padStart(2, "0");
  const hh = Math.floor(diff / 3600);
  diff %= 3600;
  return `${pad(hh)}:${pad(Math.floor(diff / 60))}:${pad(diff % 60)}`;
}

const RESULT_LABEL = {
  verified: "Verified",
  failed: "Failed",
  expired: "Expired",
};

const ZERO = { total: 0, verified: 0, pending: 0, missed: 0, feed: [] };

function formatFeedTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? String(timestamp) : formatClock(date);
}

export function buildLiveSnapshot(raw, now = new Date()) {
  const timings = decorateTimings(readMealTimings(), now);
  const activeMeal = findActiveMeal(timings, now);
  const rawByKey = new Map((raw?.meals ?? []).map((meal) => [meal.key, meal]));

  const sessions = timings.map((meal) => {
    const isActive = meal.status === "active";
    const isOff = meal.status === "off";
    const counts = isOff ? ZERO : rawByKey.get(meal.key) ?? ZERO;

    const verified = counts.verified ?? 0;
    const pending = counts.pending ?? 0;
    const expired = counts.missed ?? 0;
    const total = counts.total ?? verified + pending + expired;
    const verifiedPct = total ? Math.round(ratio(verified, total)) : 0;

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
    else if (isActive) detail = `${verifiedPct}% of eligible users verified`;
    else if (meal.status === "upcoming") detail = `Opens in ${countdown}`;
    else detail = `${verified} verified · ${expired} missed`;

    // Only the active session streams a feed.
    const feed = (isActive ? counts.feed ?? [] : []).map((row) => ({
      id: row.id,
      time: formatFeedTime(row.timestamp),
      employeeId: row.employeeId,
      name: row.name,
      meal: meal.label,
      result: row.result,
      resultLabel: RESULT_LABEL[row.result] ?? row.result,
    }));

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
      progress: isActive ? verifiedPct : null,
      detail,
      feed,
    };
  });

  return { activeMealKey: activeMeal.key, sessions };
}
