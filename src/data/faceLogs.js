import { users } from "@/data/users";

const RESULTS = [
  { key: "successful", weight: 82, label: "Successful", confidence: [94, 99] },
  { key: "failed", weight: 9, label: "Failed", confidence: [52, 68] },
  { key: "retry", weight: 9, label: "Retry", confidence: [69, 82] },
];

const GATES = ["Gate-A", "Gate-B", "Gate-C"];
const MEAL_LABELS = ["Breakfast", "Lunch", "Evening Snack", "Dinner"];

function pickResult(rng) {
  const total = RESULTS.reduce((s, r) => s + r.weight, 0);
  let roll = rng.next() * total;
  for (const r of RESULTS) {
    roll -= r.weight;
    if (roll <= 0) return r;
  }
  return RESULTS[0];
}

/**
 * Build `count` verification rows, newest first, stamped backwards from `now`.
 * @param {object} rng    seeded/live random helper (lib/random)
 * @param {number} count
 * @param {Date}   now
 */
export function buildVerificationLog(rng, count, now = new Date()) {
  const rows = [];
  let cursor = now.getTime();
  for (let i = 0; i < count; i += 1) {
    cursor -= rng.int(4, 22) * 1000; // a few seconds between events
    const at = new Date(cursor);
    const result = pickResult(rng);
    const user = rng.pick(users);
    const [lo, hi] = result.confidence;
    rows.push({
      id: `${at.getTime()}-${i}`,
      time: at.toLocaleTimeString("en-GB"),
      name: user.name,
      employeeId: user.id,
      meal: rng.pick(MEAL_LABELS),
      confidence: Number((lo + rng.next() * (hi - lo)).toFixed(1)),
      device: `${rng.pick(GATES)} · Cam 0${rng.int(1, 6)}`,
      result: result.key,
      resultLabel: result.label,
    });
  }
  return rows;
}

// First N rows reshaped for the "recent verification" card grid. 
export function toRecentCards(rows, n = 4) {
  return rows.slice(0, n).map((row) => ({
    name: row.name,
    employeeId: row.employeeId,
    result: row.result,
    resultLabel: row.resultLabel,
    confidence: row.confidence,
    meal: row.meal,
    gate: row.device.split(" · ")[0],
  }));
}
