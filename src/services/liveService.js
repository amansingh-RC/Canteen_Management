import { apiRequest, mockRequest, USE_MOCK } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { readMealTimings } from "@/services/mealTimingService";
import { decorateTimings, findActiveMeal } from "@/lib/mealStatus";
import { buildLiveSnapshot, to12h, countdownTo } from "@/lib/liveTransform";
import { buildLiveFeed } from "@/data/liveMonitoring";
import { mealSession } from "@/data/mealSessions";
import { liveRng } from "@/lib/random";
import { ratio } from "@/lib/format";

const ZERO = { total: 0, verified: 0, pending: 0, missed: 0 };

/**
 * Live snapshot. Statuses (active/upcoming/closed/off) are computed from the
 * CURRENT TIME against the centrally-stored meal windows — so as real time
 * passes (and the page polls), the active session changes automatically, and
 * any edit on the Meal Timing page is reflected here.
 */
export function getLiveMonitoring({ signal } = {}) {
  // Real backend: fetch RAW counts and transform to the display shape. Live
  // updates arrive separately over Socket.IO (see useLiveMonitoring).
  if (!USE_MOCK) {
    return apiRequest(ENDPOINTS.liveMonitoring, { signal }).then((raw) =>
      buildLiveSnapshot(raw)
    );
  }

  // Mock mode: synthesize a drifting snapshot from local data.
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
