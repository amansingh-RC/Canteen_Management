import { apiRequest } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { defaultMealTimings } from "@/data/mealTimings";

const STORAGE_KEY = "canteen-meal-timings";
const NAME_TO_KEY = {
  breakfast: "breakfast",
  lunch: "lunch",
  snack: "snack",
  snacks: "snack",
  dinner: "dinner",
};

function keyForName(name = "") {
  const lower = name.trim().toLowerCase();
  return NAME_TO_KEY[lower] ?? lower.replace(/\s+/g, "-");
}

const toHHMM = (t = "") => String(t).slice(0, 5); 
const toHHMMSS = (t = "") => (String(t).length === 5 ? `${t}:00` : t); 

function normalizeMeal(raw = {}) {
  return {
    key: keyForName(raw.name),
    mealId: raw.mealId,
    label: raw.name,
    start: toHHMM(raw.startTime),
    end: toHHMM(raw.endTime),
    enabled: Boolean(raw.isActive),
  };
}

function unwrap(res) {
  return res?.data ?? res;
}

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

export async function getMealTimings() {
  const data = unwrap(await apiRequest(ENDPOINTS.meals));
  const timings = Array.isArray(data) ? data.map(normalizeMeal) : [];
  cacheTimings(timings);
  return timings;
}

/**
 *
 * @param {Object} changes
 */
export async function updateMealTimings(changes) {
  const current = readMealTimings();
  const byKey = new Map(current.map((m) => [m.key, m]));
  const keys = Object.keys(changes);

  await Promise.all(
    keys.map((key) => {
      const meal = byKey.get(key);
      if (!meal || meal.mealId == null) return null;
      const merged = { ...meal, ...changes[key] };
      return apiRequest(ENDPOINTS.meal(meal.mealId), {
        method: "PUT",
        body: {
          name: merged.label,
          startTime: toHHMMSS(merged.start),
          endTime: toHHMMSS(merged.end),
          isActive: merged.enabled,
        },
      });
    })
  );
  cacheTimings(current.map((m) => (changes[m.key] ? { ...m, ...changes[m.key] } : m)));
  return { ok: true, changed: keys };
}
