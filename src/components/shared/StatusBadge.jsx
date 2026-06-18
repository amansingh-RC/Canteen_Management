import { Badge } from "@/components/ui/badge";
import { STATUS_VARIANT } from "@/config/meals";

/**
 * Render a status as a colored chip. Maps a status key (e.g. "used",
 * "expired", "pending") to a Badge variant via the central STATUS_VARIANT map.
 *
 * @param {string} status - status key
 * @param {string} [label] - display text (defaults to the status key)
 */
export function StatusBadge({ status, label, className }) {
  const variant = STATUS_VARIANT[status?.toLowerCase()] ?? "secondary";
  return (
    <Badge variant={variant} className={className}>
      {label ?? status}
    </Badge>
  );
}
