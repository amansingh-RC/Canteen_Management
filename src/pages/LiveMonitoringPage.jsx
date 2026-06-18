import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LiveClock } from "@/components/shared/LiveClock";
import { LiveBadge } from "@/components/shared/LiveBadge";
import { DataState } from "@/components/shared/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getLiveMonitoring } from "@/services/liveService";

export default function LiveMonitoringPage() {
  // Polls every 3s for a live, drifting view of the active session.
  const { data, loading, error, refetch } = useAsyncData(getLiveMonitoring, [], {
    pollInterval: 3000,
  });

  return (
    <>
      <PageHeader
        title="Live Monitoring"
        description="Real-time meal session tracking · updates every few seconds"
        actions={<LiveBadge />}
      />
      <DataState loading={loading} error={error} onRetry={refetch}>
        {data && <LiveContent data={data} />}
      </DataState>
    </>
  );
}

function LiveContent({ data }) {
  const { activeSession, sessionCards, liveFeed } = data;

  return (
    <div className="space-y-4">
      {/* Active session */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <StatusBadge status="active" label={`${activeSession.meal} Session Active`} />
            <h2 className="mb-0.5 mt-2.5 text-2xl font-semibold">{activeSession.window}</h2>
            <p className="text-sm text-muted-foreground">
              Current time <b><LiveClock /></b> · Window closes in <b>{activeSession.closesIn}</b>
            </p>
          </div>
          <div className="grid min-w-[320px] flex-1 grid-cols-3 gap-3">
            <KpiCard accent="green" label="Verified" value={activeSession.verified} />
            <KpiCard accent="amber" label="Pending" value={activeSession.pending} />
            <KpiCard accent="red" label="Expired" value={activeSession.expired} />
          </div>
        </CardContent>
      </Card>

      {/* Session cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {sessionCards.map((s) => (
          <Card key={s.meal} className={s.status === "active" ? "ring-2 ring-success" : ""}>
            <CardHeader>
              <CardTitle>{s.meal}</CardTitle>
              <StatusBadge status={s.status} label={s.statusLabel} />
            </CardHeader>
            <CardContent className="space-y-2">
              {s.progress != null && (
                <Progress value={s.progress} indicatorClassName="bg-success" />
              )}
              <p className="text-sm text-muted-foreground">{s.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live feed */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Live Verification Feed</CardTitle>
          <Badge variant="secondary">Auto-refreshing</Badge>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Meal</TableHead>
              <TableHead>Device / Location</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liveFeed.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-muted-foreground">{row.time}</TableCell>
                <TableCell>{row.employeeId} · {row.name}</TableCell>
                <TableCell>{row.meal}</TableCell>
                <TableCell className="text-muted-foreground">{row.device}</TableCell>
                <TableCell>
                  <StatusBadge status={row.result} label={row.resultLabel} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
