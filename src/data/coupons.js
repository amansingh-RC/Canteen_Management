import { createRng } from "@/lib/random";
import { MEALS } from "@/config/meals";
import { users } from "@/data/users";
const GENERATED_ON = "12 Jun 2026";

const MEAL_WINDOWS = {
  breakfast: [6, 9],
  lunch: [12, 15],
  snack: [16, 18],
  dinner: [19, 22],
};

const MEAL_STATUS_WEIGHTS = {
  breakfast: { used: 85, unused: 5, expired: 10 },
  lunch: { used: 80, unused: 12, expired: 8 },
  snack: { used: 55, unused: 40, expired: 5 },
  dinner: { used: 60, unused: 30, expired: 10 },
};

const STATUS_LABEL = { used: "Used", unused: "Unused", expired: "Expired" };

const rng = createRng(983201);

function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export const coupons = [];

const sequence = Object.fromEntries(MEALS.map((m) => [m.key, 0]));

for (const user of users) {
  for (const meal of MEALS) {
    sequence[meal.key] += 1;
    const status = rng.weighted(MEAL_STATUS_WEIGHTS[meal.key]);

    let verificationTime = "—";
    let verifiedHour = null;
    if (status === "used") {
      const [start, end] = MEAL_WINDOWS[meal.key];
      verifiedHour = rng.int(start, end - 1);
      verificationTime = formatTime(verifiedHour, rng.int(0, 59));
    }

    coupons.push({
      code: `${meal.prefix}2026${String(sequence[meal.key]).padStart(5, "0")}`,
      employeeId: user.id,
      userName: user.name,
      meal: meal.label,
      mealKey: meal.key,
      category: user.category,
      generatedOn: GENERATED_ON,
      verificationTime,
      verifiedHour,
      status,
      statusLabel: STATUS_LABEL[status],
    });
  }
}
