import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getMealTimings, saveMealTimings } from "@/services/mealTimingService";
import { mealStatus, STATUS_LABEL } from "@/lib/mealStatus";

export default function MealTimingsPage() {
  const { data, loading, error, refetch } = useAsyncData(getMealTimings, []);
  const [rows, setRows] = useState([]);
  const [syncedFrom, setSyncedFrom] = useState(null);
  const [saving, setSaving] = useState(false);

  if (data && data !== syncedFrom) {
    setSyncedFrom(data);
    setRows(data);
  }

  const updateRow = (key, patch) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleSave = async () => {
    setSaving(true);
    const promise = saveMealTimings(rows);
    toast.promise(promise, {
      loading: "Saving meal timings…",
      success: "Saved · The new time has been applied to all future meal sessions",
      error: "Could not save meal timings",
    });
    try {
      await promise;
    } finally {
      setSaving(false);
    }
  };

  // Live status is derived from the current time against the edited windows.
  const now = new Date();

  return (
    <>
      <PageHeader
        title="Meal Timing Settings"
        description="Set start & end times for each meal window · enable/disable slots · status updates live with the clock"
        actions={
          <Button className="bg-[#d4a24e] hover:bg-[#a87b2c]" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Meal Windows</CardTitle>
          <CardDescription>
            Enable/disable slots · set start &amp; end times · status updates live with the clock
          </CardDescription>
        </CardHeader>
        <DataState loading={loading} error={error} onRetry={refetch}>
          <div>
            {rows.map((row) => {
              const status = mealStatus(row, now);
              return (
                <div
                  key={row.key}
                  className="grid grid-cols-1 items-center gap-3 border-b px-5 py-4 last:border-0 sm:grid-cols-[160px_1fr_auto_auto]"
                >
                  <div className="flex items-center gap-2 font-semibold">
                   {row.label}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Input type="time" className="w-32" value={row.start} onChange={(e) => updateRow(row.key, { start: e.target.value })} />
                    →
                    <Input type="time" className="w-32" value={row.end} onChange={(e) => updateRow(row.key, { end: e.target.value })} />
                  </div>
                  <StatusBadge status={status} label={STATUS_LABEL[status]} />
                  <Switch checked={row.enabled} onCheckedChange={(enabled) => updateRow(row.key, { enabled })} />
                </div>
              );
            })}
          </div>
        </DataState>
      </Card>
    </>
  );
}
