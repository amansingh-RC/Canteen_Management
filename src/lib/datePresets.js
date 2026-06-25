// Quick date-range presets for reports.
// Each preset resolves to { from, to } as "YYYY-MM-DD" strings.

const pad = (n) => String(n).padStart(2, "0");

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Returns a new Date at local midnight, `days` before today.
function daysAgo(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

// Resolve a preset key to a { from, to } range. `custom` returns null so the
// caller keeps the user-picked dates.
export function rangeForPreset(key) {
  const today = daysAgo(0);
  switch (key) {
    case "today":
      return { from: toISODate(today), to: toISODate(today) };
    case "yesterday": {
      const y = daysAgo(1);
      return { from: toISODate(y), to: toISODate(y) };
    }
    case "last7":
      return { from: toISODate(daysAgo(6)), to: toISODate(today) };
    case "last10":
      return { from: toISODate(daysAgo(9)), to: toISODate(today) };
    case "last30":
      return { from: toISODate(daysAgo(29)), to: toISODate(today) };
    case "thisMonth": {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toISODate(first), to: toISODate(today) };
    }
    case "custom":
    default:
      return null;
  }
}

export const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 1 Week" },
  { key: "last10", label: "Last 10 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "custom", label: "Custom Range" },
];
