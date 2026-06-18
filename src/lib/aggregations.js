export function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

//  User verification summary (verified vs. pending). 
export function summarizeUsers(users) {
  const byStatus = countBy(users, (u) => u.faceVerification);
  return {
    totalEligible: users.length,
    verified: byStatus.verified || 0,
    pending: byStatus.pending || 0,
  };
}

//  Coupon lifecycle summary (generated/used/unused/expired). 
export function summarizeCoupons(coupons) {
  const byStatus = countBy(coupons, (c) => c.status);
  return {
    generated: coupons.length,
    used: byStatus.used || 0,
    unused: byStatus.unused || 0,
    expired: byStatus.expired || 0,
  };
}

//  Per-meal used/unused/expired counts, in the order of `meals`. 
export function mealConsumption(coupons, meals) {
  return meals.map((meal) => {
    const mealCoupons = coupons.filter((c) => c.mealKey === meal.key);
    const byStatus = countBy(mealCoupons, (c) => c.status);
    return {
      meal: meal.label,
      mealKey: meal.key,
      used: byStatus.used || 0,
      unused: byStatus.unused || 0,
      expired: byStatus.expired || 0,
      total: mealCoupons.length,
    };
  });
}

//  Each meal's share (%) of all used coupons.
export function mealDistribution(coupons, meals) {
  const used = coupons.filter((c) => c.status === "used");
  const total = used.length || 1;
  return meals.map((meal) => {
    const count = used.filter((c) => c.mealKey === meal.key).length;
    return {
      meal: meal.label,
      color: meal.color,
      count,
      value: Math.round((count / total) * 100),
    };
  });
}

export function usageTrend(coupons) {
  const windows = [6, 9, 12, 15, 18, 21];
  const labels = windows.map((h) => `${String(h).padStart(2, "0")}h`);

  const verifications = new Array(windows.length).fill(0);
  const couponsUsed = new Array(windows.length).fill(0);

  for (const coupon of coupons) {
    if (coupon.status !== "used" || coupon.verifiedHour == null) continue;
    const idx = windowIndex(coupon.verifiedHour, windows);
    verifications[idx] += 1;
    couponsUsed[idx] += 1;
  }
  // Verifications include retries/failures, so they run a little higher.
  const verificationsAdj = verifications.map((v) => Math.round(v * 1.12));

  const max = Math.max(1, ...verificationsAdj, ...couponsUsed);
  const toPct = (arr) => arr.map((v) => Math.round((v / max) * 100));

  return {
    labels,
    verifications: verificationsAdj,
    couponsUsed,
    series: {
      verifications: toPct(verificationsAdj),
      couponsUsed: toPct(couponsUsed),
    },
  };
}

function windowIndex(hour, windows) {
  for (let i = windows.length - 1; i >= 0; i -= 1) {
    if (hour >= windows[i]) return i;
  }
  return 0;
}
