import { mockRequest } from "@/services/apiClient";
import { coupons } from "@/data/coupons";
import { MEALS } from "@/config/meals";
import { summarizeCoupons, mealConsumption } from "@/lib/aggregations";

/**
 * Paginated, filtered coupon list — mirrors a real paginated API.
 * @returns {{ items, total, page, pageSize, totalPages }}
 */
export function getCoupons({ page = 1, pageSize = 12, meal, category, status } = {}) {
  return mockRequest(() => {
    const filtered = coupons.filter((c) => {
      if (meal && meal !== "All" && c.meal !== meal) return false;
      if (category && category !== "All" && c.category !== category) return false;
      if (status && status !== "All" && c.statusLabel !== status) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: filtered.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  });
}

/** Derived headline counts + per-meal breakdown (computed over the full set). */
export function getCouponStats() {
  return mockRequest(() => ({
    summary: summarizeCoupons(coupons),
    perMeal: mealConsumption(coupons, MEALS),
  }));
}
