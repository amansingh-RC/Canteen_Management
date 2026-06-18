export const reportTypes = [
  { key: "user-consumption", title: "User Consumption", description: "Per-user coupon usage across the selected range.", formats: ["Excel", "CSV", "PDF"] },
  { key: "coupon-usage", title: "Coupon Usage", description: "Generated vs. used vs. expired by meal.", formats: ["Excel", "CSV", "PDF"] },
  { key: "expired-coupons", title: "Expired Coupons", description: "All coupons that lapsed unredeemed.", formats: ["Excel", "CSV", "PDF"] },
  { key: "face-verification", title: "Face Verification", description: "Success, failure, retry and confidence stats.", formats: ["Excel", "CSV", "PDF"] },
  { key: "attendance", title: "Attendance", description: "Daily attendance derived from verifications.", formats: ["Excel", "CSV", "PDF"] },
];

export const exportHistory = {
  countThisMonth: 12,
  lastBy: "Aman S.",
};
