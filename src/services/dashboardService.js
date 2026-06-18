import { mockRequest } from "@/services/apiClient";
import { users } from "@/data/users";
import { coupons } from "@/data/coupons";
import { MEALS } from "@/config/meals";
import {
  summarizeUsers,
  summarizeCoupons,
  mealConsumption,
  mealDistribution,
  usageTrend,
} from "@/lib/aggregations";

export function getDashboardOverview() {
  return mockRequest(() => ({
    userStats: summarizeUsers(users),
    couponStats: summarizeCoupons(coupons),
    usageTrend: usageTrend(coupons),
    mealConsumption: mealConsumption(coupons, MEALS),
    mealDistribution: mealDistribution(coupons, MEALS),
  }));
}
