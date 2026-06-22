function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

export const STATUS_LABEL = {
  active: "Active",
  upcoming: "Upcoming",
  closed: "Closed",
  off: "Off",
};

export function mealStatus(meal, now = new Date()) {
  if (meal.enabled === false) return "off";
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(meal.start);
  const end = toMinutes(meal.end);
  if (cur < start) return "upcoming";
  if (cur < end) return "active";
  return "closed";
}

export function decorateTimings(timings, now = new Date()) {
  return timings.map((meal) => {
    const status = mealStatus(meal, now);
    return { ...meal, status, statusLabel: STATUS_LABEL[status] };
  });
}

export function findActiveMeal(timings, now = new Date()) {
  const decorated = decorateTimings(timings, now);
  return (
    decorated.find((m) => m.status === "active") ||
    decorated
      .filter((m) => m.status === "upcoming")
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0] ||
    decorated[0]
  );
}
