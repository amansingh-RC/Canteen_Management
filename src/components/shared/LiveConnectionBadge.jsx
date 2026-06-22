import { cn } from "@/lib/utils";
import { useSocketStatus } from "@/hooks/useSocketStatus";

const STATE = {
  mock: { label: "LIVE", text: "text-success", dot: "bg-success", pulse: true },
  connected: { label: "LIVE", text: "text-success", dot: "bg-success", pulse: true },
  connecting: { label: "Reconnecting…", text: "text-warning", dot: "bg-warning", pulse: true },
  disconnected: { label: "Offline", text: "text-muted-foreground", dot: "bg-muted-foreground", pulse: false },
};

export function LiveConnectionBadge() {
  const status = useSocketStatus();
  const state = STATE[status] ?? STATE.disconnected;

  return (
    <div className={cn("flex items-center gap-2 text-sm font-semibold", state.text)}>
      <span className="relative flex size-2.5">
        {state.pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              state.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex size-2.5 rounded-full", state.dot)} />
      </span>
      {state.label}
    </div>
  );
}
