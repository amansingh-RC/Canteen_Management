import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Legend } from "@/components/shared/Legend";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getUserDetail } from "@/services/analyticsService";
import { formatNumber } from "@/lib/format";

const PROGRESS_TONE = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
};

export default function UserDetailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get("q") || "";

  const { data, loading, error, refetch } = useAsyncData(
    () => getUserDetail(query),
    [query]
  );

  return (
    <>
      <PageHeader
        title="User Detail Analytics"
        description="Monthly history"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
            <ArrowLeft /> Back to search
          </Button>
        }
      />
      <DataState loading={loading} error={error} onRetry={refetch}>
        {data && <DetailContent data={data} />}
      </DataState>
    </>
  );
}

function DetailContent({ data }) {
  const { profile, mealSummary, mealBreakdown, verificationTimeline, calendarDays } = data;

  return (
    <div className="space-y-4">
      {/* Profile + attendance */}
      <div className="">
        <Card>
          <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-lg">{profile.initials}</AvatarFallback>
            </Avatar>
            <div>
              <b className="text-base">{profile.name}</b>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {profile.employeeId} 
                <Badge variant="info">{profile.category}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Meal attendance KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard accent="blue" label="Meals Offered" value={formatNumber(mealSummary.offered)} />
        <KpiCard accent="green" label="Attended" value={formatNumber(mealSummary.attended)} />
        <KpiCard accent="red" label="Missed" value={formatNumber(mealSummary.missed)} />
      </div>

      {/* Calendar + meal breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View — June 2026</CardTitle>
            <Legend
              items={[
                { label: "Attended", color: "var(--success)" },
                { label: "Missed", color: "var(--danger)" },
                { label: "Off / none", color: "var(--muted)" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <CalendarGrid days={calendarDays} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Meal-wise Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3.5">
            {mealBreakdown.map((m) => (
              <div key={m.meal}>
                <div className="flex items-center justify-between">
                  <b>{m.meal}</b>
                  <span className="text-muted-foreground">{m.days} days</span>
                </div>
                <Progress className="mt-1.5" value={m.percent} indicatorClassName={PROGRESS_TONE[m.variant]} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_TONE = {
  attended: "bg-success-soft",
  missed: "bg-danger-soft",
  none: "bg-background",
};

function CalendarGrid({ days }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {DOW.map((d, i) => (
        <div key={i} className="pb-0.5 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
          {d}
        </div>
      ))}
      {days.map((d) => (
        <div
          key={d.day}
          className={cn(
            "flex aspect-square flex-col items-start justify-between rounded-md border border-transparent p-1.5 text-[11px]",
            DAY_TONE[d.status],
            d.status === "none" && "border-border"
          )}
        >
          <span>{d.day}</span>
          {d.status === "attended" && (
            <span className="flex gap-0.5">
              {[0, 1, 2].map((k) => (
                <i key={k} className="size-1 rounded-full bg-success" />
              ))}
            </span>
          )}
          {d.status === "missed" && <i className="size-1 rounded-full bg-danger" />}
        </div>
      ))}
    </div>
  );
}
