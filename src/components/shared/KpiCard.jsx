import { cn } from "@/lib/utils";

/**
 *
 * @param {string} label
 * @param {string|number} value
 * @param {string} [delta] - small caption under the value
 * @param {"up"|"down"} [trend] - colors the delta
 * @param {"blue"|"green"|"amber"|"red"} [accent] - left stripe + icon tint
 * @param {React.ReactNode} [icon]
 */
const ACCENT = {
  blue: { bar: "bg-info", icon: "bg-info-soft text-info" },
  green: { bar: "bg-success", icon: "bg-success-soft text-success" },
  amber: { bar: "bg-warning", icon: "bg-warning-soft text-warning" },
  red: { bar: "bg-danger", icon: "bg-danger-soft text-danger" },
};

export function KpiCard({ label, value, delta, trend, accent = "blue", icon }) {
  const tone = ACCENT[accent] ?? ACCENT.blue;
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <span className={cn("absolute inset-y-0 left-0 w-1", tone.bar)} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon && (
          <span className={cn("grid size-7 place-items-center rounded-md text-sm", tone.icon)}>
            {icon}
          </span>
        )}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-1.5 text-[11px]",
            trend === "down" ? "text-danger" : "text-success"
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
