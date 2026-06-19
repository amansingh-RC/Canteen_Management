/**
 * Pure aggregation helpers — turn base datasets into summary metrics.
 * Kept separate from data and UI so every derived number has one testable source.
 */

/** Group an array into counts keyed by `keyFn(item)`. */
export function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/** User verification summary (verified vs. pending). */
export function summarizeUsers(users) {
  const byStatus = countBy(users, (u) => u.faceVerification);
  return {
    totalEligible: users.length,
    verified: byStatus.verified || 0,
    pending: byStatus.pending || 0,
  };
}
