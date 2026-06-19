import { Badge } from "@/components/ui/badge";
import { STATUS_VARIANT } from "@/config/meals";

/**
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
