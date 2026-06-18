/**
 * Inline chart legend.
 * @param {{label: string, color: string}[]} items
 */
export function Legend({ items, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-4 text-xs text-muted-foreground ${className}`}>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <i
            className="inline-block size-2.5 rounded-sm"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
