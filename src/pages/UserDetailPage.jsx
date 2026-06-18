import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Legend } from "@/components/shared/Legend";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        description="Monthly history · June 2026"
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
  const { profile, couponSummary, mealBreakdown, verificationTimeline, calendarDays } = data;

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

      {/* Coupon KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard accent="blue" label="Generated" value={formatNumber(couponSummary.generated)} />
        <KpiCard accent="green" label="Used" value={formatNumber(couponSummary.used)} />
        <KpiCard accent="red" label="Expired" value={formatNumber(couponSummary.expired)} />
        <KpiCard accent="amber" label="Unused" value={formatNumber(couponSummary.unused)} />
      </div>

      {/* Calendar + meal breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View — June 2026</CardTitle>
            <Legend
              items={[
                { label: "Used", color: "var(--success)" },
                { label: "Expired", color: "var(--danger)" },
                { label: "Not used", color: "var(--muted)" },
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

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Timeline</CardTitle>
          <CardDescription>Date · Meal · Verification time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative ml-2 space-y-1 border-l-2 pl-5">
            {verificationTimeline.map((ev, i) => (
              <div key={i} className="relative py-2">
                <span className="absolute -left-6.75 top-3 size-2.5 rounded-full border-2 border-card bg-primary" />
                <b>{ev.date}</b> · {ev.meal}{" "}
                <small className={cn("text-muted-foreground", ev.expired && "text-danger")}>
                  → {ev.time}
                </small>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_TONE = {
  used: "bg-success-soft",
  expired: "bg-danger-soft",
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
          {d.status === "used" && (
            <span className="flex gap-0.5">
              {[0, 1, 2].map((k) => (
                <i key={k} className="size-1 rounded-full bg-success" />
              ))}
            </span>
          )}
          {d.status === "expired" && <i className="size-1 rounded-full bg-danger" />}
        </div>
      ))}
    </div>
  );
}
