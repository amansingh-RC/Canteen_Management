import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getLiveMonitoring } from "@/services/liveService";

export default function LiveMonitoringPage() {
  // Polls every 3s for a live, drifting view of the sessions.
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
  const { sessions, activeMealKey } = data;
  // Which session the user is viewing. Null → default to the active meal.
  const [selectedKey, setSelectedKey] = useState(null);

  const current =
    sessions.find((s) => s.key === selectedKey) ||
    sessions.find((s) => s.key === activeMealKey) ||
    sessions[0];

  // The feed always reflects the live (active) session only — never past/upcoming,
  // regardless of which session card is selected above.
  const liveSession = sessions.find((s) => s.status === "active");

  return (
    <div className="space-y-4">
      {/* Selected session summary */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <StatusBadge status={current.status} label={`${current.meal} · ${current.stateLabel}`} />
            <h2 className="mb-0.5 mt-2.5 text-2xl font-semibold">{current.window}</h2>
            <p className="text-sm text-muted-foreground">
              Current time <b><LiveClock /></b>
              {current.countdown && (
                <> · {current.countdownLabel} <b>{current.countdown}</b></>
              )}
            </p>
          </div>
          <div className="grid min-w-[320px] flex-1 grid-cols-3 gap-3">
            <KpiCard accent="green" label="Verified" value={current.verified} />
            <KpiCard accent="amber" label="Pending" value={current.pending} />
            <KpiCard accent="red" label="Expired" value={current.expired} />
          </div>
        </CardContent>
      </Card>

      {/* Clickable session cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {sessions.map((s) => {
          const isSelected = s.key === current.key;
          return (
            <Card
              key={s.key}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => setSelectedKey(s.key)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedKey(s.key)}
              className={cn(
                "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "ring-2 ring-primary",
                !isSelected && s.status === "active" && "ring-1 ring-success/60"
              )}
            >
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
          );
        })}
      </div>

      {/* Live feed — always the live (active) session only, never past/upcoming */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="font-bold">
            Live Verification Feed{liveSession ? ` · ${liveSession.meal}` : ""}
          </CardTitle>
          
          <Badge variant="secondary">Auto-refreshing</Badge>
        </CardHeader>
        {liveSession && liveSession.feed.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveSession.feed.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-muted-foreground">{row.time}</TableCell>
                  <TableCell>{row.employeeId} · {row.name}</TableCell>
                  <TableCell>{row.meal}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.result} label={row.resultLabel} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No live session right now — the feed appears while a meal window is active.
          </div>
        )}
      </Card>
    </div>
  );
}
