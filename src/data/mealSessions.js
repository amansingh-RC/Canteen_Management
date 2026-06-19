import { users } from "@/data/users";

/**
 * Per-meal verification counts powering the live dashboard.
 *
 * Each eligible user is expected at each meal; for a given meal we derive how
 * many have verified, are still pending, or missed the window — deterministically
 * from the user count and a per-meal attendance rate.
 */
const TOTAL = users.length;

const RATES = {
  breakfast: { verified: 0.82, missed: 0.06 },
  lunch: { verified: 0.8, missed: 0.05 },
  snack: { verified: 0.55, missed: 0.04 },
  dinner: { verified: 0.62, missed: 0.06 },
};

/**
 * @param {string} mealKey  breakfast | lunch | snack | dinner
 * @param {string} status   closed | active | upcoming
 * @returns {{ total, verified, pending, missed }}
 */
export function mealSession(mealKey, status) {
  const total = TOTAL;

  if (status === "upcoming") {
    return { total, verified: 0, pending: total, missed: 0 };
  }

  const rate = RATES[mealKey] ?? RATES.lunch;
  const verified = Math.round(total * rate.verified);
  // A closed window has fully lapsed; an active one is only partway through.
  const missed = Math.round(total * rate.missed * (status === "closed" ? 1 : 0.5));
  const pending = Math.max(0, total - verified - missed);

  return { total, verified, pending, missed };
}
