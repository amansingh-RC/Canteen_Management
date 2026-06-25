import { useState } from "react";
import { FileSpreadsheet, FileText, CalendarDays } from "lucide-react";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getAttendanceByDate } from "@/services/reportService";
import { getDepartments } from "@/services/userService";
import { exportToExcel, exportToPdf } from "@/lib/exportReport";
import { DATE_PRESETS, rangeForPreset } from "@/lib/datePresets";

const PRESET_LABELS = DATE_PRESETS.map((p) => p.label);
const labelToKey = (label) =>
  DATE_PRESETS.find((p) => p.label === label)?.key ?? "custom";

// Default to "Last 1 Week".
function defaultFilters() {
  const range = rangeForPreset("last7");
  return { preset: "Last 1 Week", category: "All", ...range };
}

function resolveRange(draft) {
  if (labelToKey(draft.preset) === "custom") {
    return { from: draft.from, to: draft.to };
  }
  return rangeForPreset(labelToKey(draft.preset));
}

export function AttendanceSummaryReport() {
  const [draft, setDraft] = useState(defaultFilters);
  const [applied, setApplied] = useState(draft);

  const { data, loading, error, refetch } = useAsyncData(() => {
    const range = resolveRange(applied);
    return getAttendanceByDate({ ...range, category: applied.category });
  }, [applied]);

  const { data: departments } = useAsyncData(() => getDepartments(), []);
  const deptOptions = ["All", ...(departments ?? [])];

  const setField = (key) => (value) =>
    setDraft((f) => {
      const next = { ...f, [key]: value };
      // Picking a preset (other than custom) snaps the date range to it.
      if (key === "preset") {
        const range = rangeForPreset(labelToKey(value));
        if (range) Object.assign(next, range);
      }
      return next;
    });

  const applyFilters = () => setApplied(draft);
  const isCustom = labelToKey(draft.preset) === "custom";

  const columns = data?.columns ?? [];
  const rows = data?.rows ?? [];
  const totals = data?.totals ?? { total: 0 };
  const daysCount = rows.length;

  const range = resolveRange(applied);
  const fileBase = `attendance_by_date_${range.from}_to_${range.to}`;
  const subtitle = `${range.from} to ${range.to} · ${applied.category === "All" ? "All Departments" : applied.category}`;

  // Append a totals row to the exported file.
  const exportRows = () => {
    if (!rows.length) return rows;
    const totalRow = { date: "TOTAL", ...totals, employees: "" };
    return [...rows, totalRow];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <FilterSelect
            label="Date Range"
            value={draft.preset}
            onChange={setField("preset")}
            options={PRESET_LABELS}
          />
          {isCustom && (
            <>
              <DateField label="From" value={draft.from} onChange={setField("from")} />
              <DateField label="To" value={draft.to} onChange={setField("to")} />
            </>
          )}
          <FilterSelect
            label="Department"
            value={draft.category}
            onChange={setField("category")}
            options={deptOptions}
          />
          <Button
            size="sm"
            className="bg-[#d4a24e] hover:bg-[#a87b2c]"
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      <DataState loading={loading} error={error} onRetry={refetch}>
        {data && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-100 px-2.5 py-1 font-medium text-yellow-800">
                  <CalendarDays className="size-4" />
                  {range.from} → {range.to}
                </span>
                {daysCount
                  ? `Date-wise meal attendance across ${daysCount} day${daysCount === 1 ? "" : "s"}.`
                  : "No attendance found for the selected range."}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!rows.length}
                  onClick={() =>
                    exportToExcel(fileBase, "Attendance By Date", columns, exportRows())
                  }
                >
                  <FileSpreadsheet className="size-4" /> Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!rows.length}
                  onClick={() =>
                    exportToPdf(
                      fileBase,
                      "Date-wise Attendance Report",
                      subtitle,
                      columns,
                      exportRows()
                    )
                  }
                >
                  <FileText className="size-4" /> PDF
                </Button>
              </div>
            </div>

            {rows.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((c) => (
                          <TableHead key={c.key}>{c.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.rawDate}>
                          {columns.map((c) => (
                            <TableCell
                              key={c.key}
                              className={c.key === "date" ? "font-medium" : "tabular-nums"}
                            >
                              {r[c.key] ?? ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-semibold">
                        <TableCell>Total</TableCell>
                        {columns.slice(1).map((c) => (
                          <TableCell key={c.key} className="tabular-nums">
                            {c.key === "employees" ? "" : totals[c.key] ?? ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </DataState>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input
        type="date"
        className="w-44"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
