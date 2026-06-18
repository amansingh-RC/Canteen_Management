import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getReports, exportReport } from "@/services/reportService";
import { USER_CATEGORIES, MEALS } from "@/config/meals";

const DEFAULT_FILTERS = {
  from: "2026-06-01",
  to: "2026-06-12",
  // department: "All",
  category: "All",
  meal: "All",
  status: "All",
};

export default function ReportsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { data, loading, error, refetch } = useAsyncData(getReports, []);

  const setField = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <>
      <PageHeader title="Reports" description="Advanced report center" />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <DateField label="From" value={filters.from} onChange={setField("from")} />
          <DateField label="To" value={filters.to} onChange={setField("to")} />
          {/* <FilterSelect label="Department" value={filters.department} onChange={setField("department")} options={["All", ...DEPARTMENTS]} /> */}
          <FilterSelect label="Category" value={filters.category} onChange={setField("category")} options={["All", ...USER_CATEGORIES]} />
          <FilterSelect label="Meal Type" value={filters.meal} onChange={setField("meal")} options={["All", ...MEALS.map((m) => m.label)]} />
          <FilterSelect label="Status" value={filters.status} onChange={setField("status")} options={["All", "Used", "Expired"]} />
        </CardContent>
      </Card>

      <DataState loading={loading} error={error} onRetry={refetch}>
        {data && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.reportTypes.map((report) => (
              <Card key={report.key}>
                <CardHeader><CardTitle>{report.title}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {report.formats.map((fmt) => (
                      <Button
                        key={fmt}
                        variant="outline"
                        size="sm"
                        onClick={() => exportReport(report.key, fmt, filters)}
                      >
                        {fmt}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader><CardTitle>Export History</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {data.exportHistory.countThisMonth} exports this month · last by {data.exportHistory.lastBy}
                </p>
                <Button variant="ghost" size="sm">View log →</Button>
              </CardContent>
            </Card>
          </div>
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
