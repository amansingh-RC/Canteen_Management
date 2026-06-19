import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getReports, exportReport } from "@/services/reportService";
import { USER_CATEGORIES, MEALS } from "@/config/meals";

const DEFAULT_FILTERS = {
  from: "2026-06-01",
  to: "2026-06-12",
  category: "All",
  meal: "All",
  status: "All",
};

export default function ReportsPage() {
  // `draft` is edited live; `applied` is what the reports are generated for.
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [applied, setApplied] = useState(DEFAULT_FILTERS);

  const { data, loading, error, refetch } = useAsyncData(
    () => getReports(applied),
    [applied]
  );

  const setField = (key) => (value) => setDraft((f) => ({ ...f, [key]: value }));
  const applyFilters = () => setApplied(draft);

  return (
    <>
      <PageHeader title="Reports" description="Advanced report center" />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <DateField label="From" value={draft.from} onChange={setField("from")} />
          <DateField label="To" value={draft.to} onChange={setField("to")} />
          <FilterSelect label="Category" value={draft.category} onChange={setField("category")} options={["All", ...USER_CATEGORIES]} />
          <FilterSelect label="Meal Type" value={draft.meal} onChange={setField("meal")} options={["All", ...MEALS.map((m) => m.label)]} />
          <FilterSelect label="Status" value={draft.status} onChange={setField("status")} options={["All", "Attended", "Missed"]} />
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
              <Badge variant="info">{data.reportTypes[0]?.scope ?? "All data"}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.reportTypes.map((report) => (
                <Card key={report.key}>
                  <CardHeader><CardTitle>{report.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Scope: <b className="text-foreground">{report.scope}</b>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.formats.map((fmt) => (
                        <Button
                          key={fmt}
                          variant="outline"
                          size="sm"
                          onClick={() => exportReport(report.key, fmt, applied)}
                        >
                          {fmt}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </DataState>
    </>
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
