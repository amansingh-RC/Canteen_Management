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
import { getMealTimings, updateMealTimings } from "@/services/mealTimingService";
import { mealStatus, STATUS_LABEL } from "@/lib/mealStatus";

// Editable fields per meal — only these are diffed/sent on save.
const EDITABLE_FIELDS = ["start", "end", "enabled"];

/**
 * Diff edited rows against the last-saved baseline. Returns only the meals that
 * changed, and within each, only the fields that changed:
 *   { lunch: { start: "12:30" } }
 */
function diffTimings(baseline, rows) {
  const baseByKey = new Map(baseline.map((m) => [m.key, m]));
  const changes = {};
  for (const row of rows) {
    const base = baseByKey.get(row.key);
    if (!base) continue;
    const fieldDiff = {};
    for (const field of EDITABLE_FIELDS) {
      if (row[field] !== base[field]) fieldDiff[field] = row[field];
    }
    if (Object.keys(fieldDiff).length) changes[row.key] = fieldDiff;
  }
  return changes;
}

export default function MealTimingsPage() {
  const { data, loading, error, refetch } = useAsyncData(getMealTimings, []);
  const [rows, setRows] = useState([]);
  // Last-saved snapshot; the diff sent to the backend is computed against this.
  const [baseline, setBaseline] = useState(null);
  const [saving, setSaving] = useState(false);

  // Seed the form once, when data first arrives (don't clobber edits later).
  if (data && baseline === null) {
    setBaseline(data);
    setRows(data);
  }

  const updateRow = (key, patch) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleSave = async () => {
    const changes = diffTimings(baseline ?? [], rows);

    // Nothing edited → don't send an empty request.
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    const promise = updateMealTimings(changes);
    toast.promise(promise, {
      loading: "Saving meal timings…",
      success: "Saved · The new time has been applied to all future meal sessions",
      error: "Could not save meal timings",
    });
    try {
      await promise;
      // Advance the baseline so the next save diffs against what we just saved.
      setBaseline(rows);
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
