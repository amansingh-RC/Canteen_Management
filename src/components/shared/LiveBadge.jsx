export function LiveBadge({ label = "LIVE" }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-success">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-success" />
      </span>
      {label}
    </div>
  );
}
