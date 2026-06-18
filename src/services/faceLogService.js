import { mockRequest } from "@/services/apiClient";
import { coupons } from "@/data/coupons";
import { buildVerificationLog, toRecentCards } from "@/data/faceLogs";
import { liveRng } from "@/lib/random";
import { summarizeCoupons } from "@/lib/aggregations";

export function getFaceVerificationData() {
  return mockRequest(() => {
    const { used } = summarizeCoupons(coupons);
    const failed = Math.round(used * 0.054);
    const retries = Math.round(used * 0.024);

    const log = buildVerificationLog(liveRng, 16, new Date());

    return {
      faceStats: { successful: used, failed, retries },
      recentVerifications: toRecentCards(log, 4),
      faceLogs: log,
    };
  });
}
