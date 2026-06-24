import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getReports } from "@/services/reportService";
import { exportToExcel, exportToPdf } from "@/lib/exportReport";
import { USER_CATEGORIES, MEALS } from "@/config/meals";

// Default range: 1st of the current month → today.
function defaultFilters() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${pad(now.getDate())}`,
    category: "All",
    meal: "All",
  };
}

export default function ReportsPage() {
  const [draft, setDraft] = useState(defaultFilters);
  const [applied, setApplied] = useState(draft);

  const { data, loading, error, refetch } = useAsyncData(() => getReports(applied), [applied]);

  const setField = (key) => (value) => setDraft((f) => ({ ...f, [key]: value }));
  const applyFilters = () => setApplied(draft);

  return (
    <>
      <PageHeader title="Reports" description="Generate and export attendance reports" />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <DateField label="From" value={draft.from} onChange={setField("from")} />
          <DateField label="To" value={draft.to} onChange={setField("to")} />
          <FilterSelect label="Category" value={draft.category} onChange={setField("category")} options={["All", ...USER_CATEGORIES]} />
          <FilterSelect label="Meal Type" value={draft.meal} onChange={setField("meal")} options={["All", ...MEALS.map((m) => m.label)]} />
          <Button size="sm" className="bg-[#d4a24e] hover:bg-[#a87b2c]" onClick={applyFilters}>
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      <DataState loading={loading} error={error} onRetry={refetch}>
        {data && (
          <>
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Reports for:</span>
              <Badge variant="info">{data.scope}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ReportCard report={data.attendance} scope={data.scope} filters={applied} />
              <ReportCard report={data.expired} scope={data.scope} filters={applied} />
            </div>
          </>
        )}
      </DataState>
    </>
  );
}

function ReportCard({ report, scope, filters }) {
  const { title, description, columns, rows } = report;
  const fileBase = `${report.key}_${filters.from}_${filters.to}`;
  const subtitle = `${filters.from} to ${filters.to}`;

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">
          Scope: <b className="text-foreground">{scope}</b>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.length}
            onClick={() => exportToExcel(fileBase, title, columns, rows)}
          >
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.length}
            onClick={() => exportToPdf(fileBase, title, subtitle, columns, rows)}
          >
            <FileText className="size-4" /> PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input type="date" className="w-44" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
