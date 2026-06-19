import { mockRequest } from "@/services/apiClient";
import { readMealTimings } from "@/services/mealTimingService";
import { decorateTimings, findActiveMeal } from "@/lib/mealStatus";
import { buildLiveFeed } from "@/data/liveMonitoring";
import { mealSession } from "@/data/mealSessions";
import { liveRng } from "@/lib/random";
import { ratio } from "@/lib/format";

function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
}

// "HH:MM:SS" remaining until target "HH:MM" today (clamped at zero).
function countdownTo(hhmm, now) {
  const [h, m] = hhmm.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  let diff = Math.max(0, Math.floor((target - now) / 1000));
  const pad = (n) => String(n).padStart(2, "0");
  const hh = Math.floor(diff / 3600);
  diff %= 3600;
  return `${pad(hh)}:${pad(Math.floor(diff / 60))}:${pad(diff % 60)}`;
}

const ZERO = { total: 0, verified: 0, pending: 0, missed: 0 };

/**
 * Live snapshot. Statuses (active/upcoming/closed/off) are computed from the
 * CURRENT TIME against the centrally-stored meal windows — so as real time
 * passes (and the page polls), the active session changes automatically, and
 * any edit on the Meal Timing page is reflected here.
 */
export function getLiveMonitoring() {
  return mockRequest(
    () => {
      const now = new Date();
      const timings = decorateTimings(readMealTimings(), now);
      const activeMeal = findActiveMeal(timings, now);

      const sessions = timings.map((meal) => {
        const isActive = meal.status === "active";
        const isOff = meal.status === "off";
        const counts = isOff ? ZERO : mealSession(meal.key, meal.status);

        // Live drift only for the in-progress meal.
        const drift = isActive ? liveRng.int(0, 5) : 0;
        const verified = counts.verified + drift;
        const pending = Math.max(0, counts.pending - drift);
        const expired = counts.missed;
        const verifiedPct = counts.total ? Math.round(ratio(verified, counts.total)) : 0;

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
        else if (meal.status === "active") detail = `${verifiedPct}% of eligible users verified`;
        else if (meal.status === "upcoming") detail = `Opens in ${countdown}`;
        else detail = `${verified} verified · ${expired} missed`;

        // Only the active session streams a feed (the feed shows the live session only).
        const feed = isActive ? buildLiveFeed(liveRng, 6, meal.label, now) : [];

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
    },
    { latency: 250 }
  );
}
