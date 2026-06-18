import { ScanFace } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LiveBadge } from "@/components/shared/LiveBadge";
import { DataState } from "@/components/shared/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getFaceVerificationData } from "@/services/faceLogService";
import { formatNumber } from "@/lib/format";

export default function FaceVerificationPage() {
  // Polls every 4s so the verification feed "streams" new rows.
  const { data, loading, error, refetch } = useAsyncData(getFaceVerificationData, [], {
    pollInterval: 4000,
  });

  return (
    <>
      <PageHeader
        title="Face Verification Logs"
        description="Monitoring screen · live verification activity"
        actions={<LiveBadge />}
      />
      <DataState loading={loading} error={error} onRetry={refetch}>
        {data && <FaceContent data={data} />}
      </DataState>
    </>
  );
}

function FaceContent({ data }) {
  const { faceStats, recentVerifications, faceLogs } = data;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard accent="green" icon={<ScanFace className="size-4" />} label="Successful" value={formatNumber(faceStats.successful)} />
        <KpiCard accent="red" label="Failed" value={formatNumber(faceStats.failed)} />
        <KpiCard accent="amber" label="Retries" value={formatNumber(faceStats.retries)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Verifications</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentVerifications.map((v) => (
              <div key={v.employeeId} className="overflow-hidden rounded-xl border">
                <div className="grid aspect-[1.1] place-items-center bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_10px,var(--background)_10px,var(--background)_20px)] text-muted-foreground">
                  <ScanFace className="size-8" />
                </div>
                <div className="space-y-1.5 p-3">
                  <b className="text-sm">{v.name} · {v.employeeId}</b>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <StatusBadge status={v.result} label={statusLabel(v.result)} />
                    <span>{v.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{v.meal}</span><span>{v.gate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>Verification Log</CardTitle></CardHeader>
        <div className="max-h-[50vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Device / Location</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faceLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground">{log.time}</TableCell>
                  <TableCell>{log.name} · {log.employeeId}</TableCell>
                  <TableCell>{log.meal}</TableCell>
                  <TableCell className="font-semibold">{log.confidence}%</TableCell>
                  <TableCell className="text-muted-foreground">{log.device}</TableCell>
                  <TableCell><StatusBadge status={log.result} label={log.resultLabel} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function statusLabel(result) {
  return { successful: "Successful", failed: "Failed", retry: "Retry" }[result] ?? result;
}
