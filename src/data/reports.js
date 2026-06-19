export const reportTypes = [
  { key: "meal-consumption", title: "Meal Consumption", description: "Per-user meal attendance across the selected range.", formats: ["Excel", "CSV", "PDF"] },
  { key: "meal-summary", title: "Meal Summary", description: "Attended vs. missed by meal.", formats: ["Excel", "CSV", "PDF"] },
  { key: "face-verification", title: "Face Verification", description: "Success, failure, retry and confidence stats.", formats: ["Excel", "CSV", "PDF"] },
  { key: "attendance", title: "Attendance", description: "Daily attendance derived from verifications.", formats: ["Excel", "CSV", "PDF"] },
];

export const exportHistory = {
  countThisMonth: 12,
  lastBy: "Aman S.",
};
