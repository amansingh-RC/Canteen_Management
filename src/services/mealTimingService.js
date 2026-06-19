import { mockRequest } from "@/services/apiClient";
import { defaultMealTimings } from "@/data/mealTimings";

const STORAGE_KEY = "canteen-meal-timings";

/** Synchronous read of the current windows (persisted override or defaults). */
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

/** Async read for pages/components. */
export function getMealTimings() {
  return mockRequest(() => readMealTimings());
}

/** Persist edited windows so the whole app uses them. */
export function saveMealTimings(timings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timings));
  } catch {
    /* ignore quota/serialization errors */
  }
  return mockRequest({ ok: true, saved: timings }, { latency: 400 });
}
