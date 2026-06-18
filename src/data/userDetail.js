import { createRng } from "@/lib/random";
import { MEALS } from "@/config/meals";
const DAYS_IN_MONTH = 30;
const MONTH_START_DOW = 0;

function initialsOf(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function seedFromId(id) {
  return [...id].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) >>> 0;
}

export function buildUserDetail(user) {
  const rng = createRng(seedFromId(user.id));

  // Daily × meal records for the month.
  const records = [];
  const calendarDays = [];

  for (let day = 1; day <= DAYS_IN_MONTH; day += 1) {
    const isWeekend = (MONTH_START_DOW + day - 1) % 7 >= 5;
    let dayUsed = false;
    let dayExpired = false;

    if (!isWeekend) {
      for (const meal of MEALS) {
        const status = rng.weighted({ used: 80, expired: 8, none: 12 });
        if (status === "none") continue;
        records.push({ day, meal, status });
        if (status === "used") dayUsed = true;
        else if (status === "expired") dayExpired = true;
      }
    }

    calendarDays.push({
      day,
      status: dayUsed ? "used" : dayExpired ? "expired" : "none",
    });
  }

  // Summary
  const generated = records.length;
  const used = records.filter((r) => r.status === "used").length;
  const expired = records.filter((r) => r.status === "expired").length;

  // Per-meal breakdown
  const VARIANT = { breakfast: "info", lunch: "success", snack: "warning", dinner: "info" };
  const mealBreakdown = MEALS.map((meal) => {
    const mealRecords = records.filter((r) => r.meal.key === meal.key);
    const usedDays = mealRecords.filter((r) => r.status === "used").length;
    const totalDays = mealRecords.length || 1;
    return {
      meal: meal.label,
      days: usedDays,
      percent: Math.round((usedDays / totalDays) * 100),
      variant: VARIANT[meal.key],
    };
  });

  // Timeline — first few used events with a plausible time per meal.
  const MEAL_HOUR = { breakfast: "08:10 AM", lunch: "01:15 PM", snack: "04:40 PM", dinner: "08:05 PM" };
  const verificationTimeline = records.slice(0, 6).map((r) => ({
    date: `${String(r.day).padStart(2, "0")} Jun`,
    meal: r.meal.label,
    time: r.status === "expired" ? "Expired" : MEAL_HOUR[r.meal.key],
    expired: r.status === "expired",
  }));

  return {
    profile: {
      name: user.name,
      initials: initialsOf(user.name),
      employeeId: user.id,
      // department: user.department,
      category: user.category,
      attendance: user.monthlyAttendance,
    },
    couponSummary: { generated, used, expired, unused: generated - used - expired },
    mealBreakdown,
    verificationTimeline,
    calendarDays,
  };
}
