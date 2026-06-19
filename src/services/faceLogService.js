import { mockRequest } from "@/services/apiClient";
import { users } from "@/data/users";
import { buildVerificationLog, toRecentCards } from "@/data/faceLogs";
import { liveRng } from "@/lib/random";

/**
 * Face verification snapshot.
 *  - stats: derived from the user base (successful ≈ eligible users × meals/day ×
 *    attendance).
 *  - log/recent: freshly streamed each call (poll → new rows) so the screen feels live.
 */
const SUCCESSFUL = Math.round(users.length * 2.7);

export function getFaceVerificationData() {
  return mockRequest(() => {
    const successful = SUCCESSFUL;
    const failed = Math.round(successful * 0.054);
    const retries = Math.round(successful * 0.024);

    const log = buildVerificationLog(liveRng, 16, new Date());

    return {
      faceStats: { successful, failed, retries },
      recentVerifications: toRecentCards(log, 4),
      faceLogs: log,
    };
  });
}
