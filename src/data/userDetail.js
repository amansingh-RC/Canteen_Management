import { createRng } from "@/lib/random";
import { MEALS } from "@/config/meals";

/**
 * Build a single user's monthly meal-attendance analytics (June 2026) on the fly.
 * Everything — summary, per-meal breakdown, calendar, timeline — is derived from
 * one generated set of daily records, seeded per-user so it's stable per person.
 */
const DAYS_IN_MONTH = 30;
const MONTH_START_DOW = 0; // June 1, 2026 is a Monday (Mon-first grid → 0)

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

  // Daily × meal records for the month. Each weekday meal is attended, missed, or off.
  const records = [];
  const calendarDays = [];

  for (let day = 1; day <= DAYS_IN_MONTH; day += 1) {
    const isWeekend = (MONTH_START_DOW + day - 1) % 7 >= 5;
    let dayAttended = false;
    let dayMissed = false;

    if (!isWeekend) {
      for (const meal of MEALS) {
        const status = rng.weighted({ attended: 80, missed: 8, none: 12 });
        if (status === "none") continue;
        records.push({ day, meal, status });
        if (status === "attended") dayAttended = true;
        else if (status === "missed") dayMissed = true;
      }
    }

    calendarDays.push({
      day,
      status: dayAttended ? "attended" : dayMissed ? "missed" : "none",
    });
  }

  // Summary
  const offered = records.length;
  const attended = records.filter((r) => r.status === "attended").length;
  const missed = records.filter((r) => r.status === "missed").length;

  // Per-meal breakdown
  const VARIANT = { breakfast: "info", lunch: "success", snack: "warning", dinner: "info" };
  const mealBreakdown = MEALS.map((meal) => {
    const mealRecords = records.filter((r) => r.meal.key === meal.key);
    const attendedDays = mealRecords.filter((r) => r.status === "attended").length;
    const totalDays = mealRecords.length || 1;
    return {
      meal: meal.label,
      days: attendedDays,
      percent: Math.round((attendedDays / totalDays) * 100),
      variant: VARIANT[meal.key],
    };
  });

  // Timeline — first few events with a plausible verification time per meal.
  const MEAL_HOUR = { breakfast: "08:10 AM", lunch: "01:15 PM", snack: "04:40 PM", dinner: "08:05 PM" };
  const verificationTimeline = records.slice(0, 6).map((r) => ({
    date: `${String(r.day).padStart(2, "0")} Jun`,
    meal: r.meal.label,
    time: r.status === "missed" ? "Missed" : MEAL_HOUR[r.meal.key],
    missed: r.status === "missed",
  }));

  return {
    profile: {
      name: user.name,
      initials: initialsOf(user.name),
      employeeId: user.id,
      category: user.category,
      attendance: user.monthlyAttendance,
    },
    mealSummary: { offered, attended, missed },
    mealBreakdown,
    verificationTimeline,
    calendarDays,
  };
}
