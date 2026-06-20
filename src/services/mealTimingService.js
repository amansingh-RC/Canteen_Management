import { apiRequest, mockRequest, USE_MOCK } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { defaultMealTimings } from "@/data/mealTimings";

const STORAGE_KEY = "canteen-meal-timings";

/**
 * Synchronous read of the current windows (cached override or defaults).
 *
 * This is the single synchronous source of truth used by live status
 * derivation (see liveTransform). In backend mode getMealTimings() refreshes
 * this cache, so the live screen always sees the latest windows.
 */
export function readMealTimings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore corrupted storage and fall back to defaults */
  }
  return defaultMealTimings;
}

function cacheTimings(timings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timings));
  } catch {
    /* ignore quota/serialization errors */
  }
}

/** Apply a partial { [key]: {fields…} } change set onto the full list. */
function mergeChanges(timings, changes) {
  return timings.map((meal) =>
    changes[meal.key] ? { ...meal, ...changes[meal.key] } : meal
  );
}

/** Async read for pages/components. In backend mode, fetch + refresh cache. */
export async function getMealTimings() {
  if (!USE_MOCK) {
    const timings = await apiRequest(ENDPOINTS.mealTimings);
    cacheTimings(timings);
    return timings;
  }
  return mockRequest(() => readMealTimings());
}

/**
 * Persist ONLY the changed meals/fields.
 *
 * @param {Object} changes  { [mealKey]: { start?, end?, enabled? } } — contains
 *                          just the meals that changed, and within each, just
 *                          the fields that changed. Unchanged meals are omitted.
 *
 * Backend mode → PATCH with the partial body (the backend applies the diff).
 * Mock mode    → merge the diff into the stored full list locally.
 * Either way the local cache is kept in sync so the live screen reflects it.
 */
export function updateMealTimings(changes) {
  if (!USE_MOCK) {
    return apiRequest(ENDPOINTS.mealTimings, {
      method: "PATCH",
      body: { changes },
    }).then((result) => {
      cacheTimings(mergeChanges(readMealTimings(), changes));
      return result;
    });
  }

  cacheTimings(mergeChanges(readMealTimings(), changes));
  return mockRequest({ ok: true, changes }, { latency: 400 });
}
