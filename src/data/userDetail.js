import { createRng } from "@/lib/random";
import { MEALS } from "@/config/meals";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ANCHOR = { year: 2026, month: 6 };

export function getMonthOptions(count = 6) {
  const options = [];
  let { year, month } = ANCHOR;
  for (let i = 0; i < count; i += 1) {
    options.push({
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
    });
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  return options;
}

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

function parseMonthKey(key) {
  if (typeof key === "string" && /^\d{4}-\d{2}$/.test(key)) {
    const [year, month] = key.split("-").map(Number);
    return { year, month };
  }
  return { ...ANCHOR };
}

export function buildUserDetail(user, monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const rng = createRng((seedFromId(user.id) ^ (year * 100 + month)) >>> 0);

  const daysInMonth = new Date(year, month, 0).getDate();
  const startDow = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Mon-first grid

  const records = [];
  const calendarDays = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dow = (startDow + day - 1) % 7;
    const isWeekend = dow >= 5;
    const attendedMeals = [];
    let anyMissed = false;

    if (!isWeekend) {
      for (const meal of MEALS) {
        const status = rng.weighted({ attended: 80, missed: 8, none: 12 });
        if (status === "none") continue;
        records.push({ day, meal, status });
        if (status === "attended") attendedMeals.push(meal.key);
        else anyMissed = true;
      }
    }

    calendarDays.push({
      day,
      attendedMeals, // meal keys attended that day → one colored dot each
      missed: attendedMeals.length === 0 && anyMissed,
      status: attendedMeals.length ? "attended" : anyMissed ? "missed" : "none",
    });
  }

  const offered = records.length;
  const attended = records.filter((r) => r.status === "attended").length;
  const missed = records.filter((r) => r.status === "missed").length;
  const attendancePct = offered ? Math.round((attended / offered) * 100) : 0;
  
  const mealBreakdown = MEALS.map((meal) => {
    const mealRecords = records.filter((r) => r.meal.key === meal.key);
    const attendedDays = mealRecords.filter((r) => r.status === "attended").length;
    const totalDays = mealRecords.length || 1;
    return {
      key: meal.key,
      meal: meal.label,
      color: meal.color,
      days: attendedDays,
      percent: Math.round((attendedDays / totalDays) * 100),
    };
  });

  return {
    month: {
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
    },
    startDow,
    profile: {
      name: user.name,
      initials: initialsOf(user.name),
      employeeId: user.id,
      category: user.category,
      attendance: attendancePct,
    },
    mealSummary: { offered, attended, missed },
    mealBreakdown,
    calendarDays,
  };
}
