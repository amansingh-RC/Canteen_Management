export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatPercent(value, { fromRatio = false, digits = 1 } = {}) {
  if (value === null || value === undefined) return "—";
  const pct = fromRatio ? value * 100 : value;
  return `${pct.toFixed(digits)}%`;
}

export function ratio(part, whole) {
  if (!whole) return 0;
  return Math.min(100, Math.max(0, (part / whole) * 100));
}

export function formatClock(date = new Date()) {
  return date.toLocaleTimeString("en-GB");
}
