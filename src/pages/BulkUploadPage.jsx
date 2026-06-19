import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <Button size="sm" className="mt-1 bg-[#d4a24e] hover:bg-[#a87b2c]" type="button">Browse files</Button>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-[#219f5e] hover:bg-[#2ab36c] " size="sm"><FileSpreadsheet /> Import</Button>
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

    </>
  );
}
