import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

export function Pagination({ page, pageSize, total, totalPages, onPageChange }) {
  if (!total) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
      <span>
        Showing <b className="text-foreground">{formatNumber(start)}–{formatNumber(end)}</b> of{" "}
        <b className="text-foreground">{formatNumber(total)}</b>
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft /> Prev
        </Button>
        <span className="px-1">
          Page <b className="text-foreground">{page}</b> / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
