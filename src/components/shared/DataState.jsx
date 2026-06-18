import { AlertCircle } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function DataState({ loading, error, onRetry, skeleton, children }) {
  if (loading) {
    return (
      skeleton ?? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card p-10 text-center">
        <AlertCircle className="size-8 text-danger" />
        <div>
          <p className="font-medium">Couldn’t load this data</p>
          <p className="text-sm text-muted-foreground">
            {error.message || "Something went wrong."}
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  return children;
}
