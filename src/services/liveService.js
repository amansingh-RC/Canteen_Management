import { mockRequest } from "@/services/apiClient";
import { coupons } from "@/data/coupons";
import { mealTimings } from "@/data/mealTimings";
import { buildLiveFeed } from "@/data/liveMonitoring";
import { liveRng } from "@/lib/random";
import { mealConsumption } from "@/lib/aggregations";
import { MEALS } from "@/config/meals";
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

export function getLiveMonitoring() {
  return mockRequest(
    () => {
      const now = new Date();
      const perMeal = mealConsumption(coupons, MEALS);
      const byKey = Object.fromEntries(perMeal.map((m) => [m.mealKey, m]));

      const active = mealTimings.find((m) => m.status === "active") || mealTimings[0];
      const activeCounts = byKey[active.key];
      // Small live drift to simulate verifications happening right now.
      const drift = liveRng.int(0, 5);

      const activeSession = {
        meal: active.label,
        window: `${to12h(active.start)} – ${to12h(active.end)}`,
        closesIn: countdownTo(active.end, now),
        verified: activeCounts.used + drift,
        pending: Math.max(0, activeCounts.unused - drift),
        expired: activeCounts.expired,
      };

      const sessionCards = mealTimings.map((meal) => {
        const counts = byKey[meal.key];
        const verifiedPct = Math.round(ratio(counts.used, counts.total));
        let detail;
        if (meal.status === "active") detail = `${verifiedPct}% of eligible users verified`;
        else if (meal.status === "upcoming") detail = `Window opens in ${countdownTo(meal.start, now)}`;
        else detail = `${counts.used} verified · ${counts.expired} expired`;
        return {
          meal: meal.label,
          status: meal.status,
          statusLabel: meal.status === "upcoming" ? `Upcoming ${meal.start}` : meal.statusLabel,
          window: `${meal.start}–${meal.end}`,
          detail,
          progress: meal.status === "active" ? verifiedPct : null,
        };
      });

      const liveFeed = buildLiveFeed(liveRng, 6, active.label, now);

      return { activeSession, sessionCards, liveFeed };
    },
    { latency: 250 }
  );
}
