import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getLastImport } from "@/services/bulkUploadService";
import { formatNumber } from "@/lib/format";

export default function BulkUploadPage() {
  const { data, loading, error, refetch } = useAsyncData(getLastImport, []);

  return (
    <>
      <PageHeader
        title="Bulk Upload Users"
        description="Import temporary users via CSV or Excel"
        actions={<Button variant="outline" size="sm"><Download /> Download Template</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Upload File</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-background p-8 text-center text-muted-foreground transition-colors hover:border-primary/50">
              <UploadCloud className="size-9" />
              <b className="text-foreground">Drop CSV / Excel here</b>
              <span className="text-sm">or browse — .csv, .xlsx up to 10MB</span>
              <input type="file" accept=".csv,.xlsx" className="hidden" />
              <Button size="sm" className="mt-1" type="button">Browse files</Button>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Validate Data</Button>
              <Button variant="outline" size="sm">Preview Records</Button>
              <Button variant="success" size="sm"><FileSpreadsheet /> Import</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Import Summary</CardTitle></CardHeader>
          <CardContent>
            <DataState loading={loading} error={error} onRetry={refetch}>
              {data && (
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard accent="blue" label="Total Uploaded" value={formatNumber(data.importSummary.totalUploaded)} />
                  <KpiCard accent="green" label="Successful" value={formatNumber(data.importSummary.successful)} />
                  <KpiCard accent="red" label="Failed" value={formatNumber(data.importSummary.failed)} />
                  <KpiCard accent="amber" label="Duplicates" value={formatNumber(data.importSummary.duplicates)} />
                </div>
              )}
            </DataState>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader>
          <CardTitle>Validation Errors</CardTitle>
          <CardDescription>{data?.validationErrors.length ?? 0} rows need attention</CardDescription>
        </CardHeader>
        <DataState loading={loading} error={error} onRetry={refetch}>
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Error Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.validationErrors.map((err) => (
                  <TableRow key={err.row}>
                    <TableCell>{err.row}</TableCell>
                    <TableCell>{err.employeeId}</TableCell>
                    <TableCell>
                      <StatusBadge status={err.severity === "danger" ? "expired" : "pending"} label={err.reason} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataState>
      </Card>
    </>
  );
}
