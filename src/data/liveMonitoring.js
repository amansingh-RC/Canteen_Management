import { users } from "@/data/users";

const GATES = ["Gate-A", "Gate-B", "Gate-C"];

export function buildLiveFeed(rng, count, mealLabel, now = new Date()) {
  const rows = [];
  let cursor = now.getTime();
  for (let i = 0; i < count; i += 1) {
    cursor -= rng.int(3, 18) * 1000;
    const at = new Date(cursor);
    const user = rng.pick(users);
    const verified = rng.chance(0.88);
    rows.push({
      id: `${at.getTime()}-${i}`,
      time: at.toLocaleTimeString("en-GB"),
      employeeId: user.id,
      name: user.name,
      meal: mealLabel,
      device: `${rng.pick(GATES)} · Cam 0${rng.int(1, 6)}`,
      result: verified ? "verified" : "failed",
      resultLabel: verified ? "Verified" : "Failed",
    });
  }
  return rows;
}
