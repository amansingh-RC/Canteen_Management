import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getUserDetail } from "@/services/analyticsService";
import { getMonthOptions } from "@/data/userDetail";
import { formatNumber } from "@/lib/format";
import { MEALS } from "@/config/meals";
const MONTH_OPTIONS = getMonthOptions(6);
const MEAL_COLOR = Object.fromEntries(MEALS.map((m) => [m.key, m.color]));

export default function UserDetailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get("q") || "";
  const [month, setMonth] = useState(MONTH_OPTIONS[0].key);

  const { data, loading, error, refetch } = useAsyncData(
    () => getUserDetail(query, month),
    [query, month]
  );

  return (
    <>
      <PageHeader
        title="User Detail Analytics"
        description="Monthly meal-attendance history"
        actions={
          <div className="flex items-center gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
              <ArrowLeft /> Back to search
            </Button>
          </div>
        }
      />
      <DataState loading={loading} error={error} onRetry={refetch}>
        {data && <DetailContent data={data} />}
      </DataState>
    </>
  );
}

function DetailContent({ data }) {
  const { profile, mealSummary, mealBreakdown, calendarDays, startDow, month } = data;

  return (
    <div className="space-y-4">
      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums">{profile.attendance}%</div>
            <div className="text-xs text-muted-foreground">Attendance · {month.label}</div>
          </div>
        </CardContent>
      </Card>

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
            <CardTitle>Calendar View — {month.label}</CardTitle>
            <Legend
              items={[
                ...MEALS.map((m) => ({ label: m.label, color: m.color })),
                { label: "Missed", color: "var(--danger)" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <CalendarGrid days={calendarDays} startDow={startDow} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Meal-wise Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3.5">
            {mealBreakdown.map((m) => (
              <div key={m.key}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="size-2.5 rounded-full" style={{ background: m.color }} />
                    <b>{m.meal}</b>
                  </span>
                  <span className="text-muted-foreground">{m.days} days</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.percent}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const DOW = ["M", "T", "W", "T", "F", "S", "S"];

function CalendarGrid({ days, startDow }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {DOW.map((d, i) => (
        <div key={i} className="pb-0.5 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
          {d}
        </div>
      ))}
      {/* Leading blanks so day 1 lands on the correct weekday */}
      {Array.from({ length: startDow }).map((_, i) => (
        <div key={`blank-${i}`} />
      ))}
      {days.map((d) => (
        <div
          key={d.day}
          className={cn(
            "flex aspect-square flex-col items-start justify-between rounded-md border p-1.5 text-[11px]",
            d.status === "none" && "bg-muted/40"
          )}
        >
          <span className={d.status === "none" ? "text-muted-foreground" : ""}>{d.day}</span>
          <span className="flex flex-wrap gap-0.5">
            {d.attendedMeals.map((key) => (
              <i key={key} className="size-1.5 rounded-full" style={{ background: MEAL_COLOR[key] }} />
            ))}
            {d.missed && <i className="size-1.5 rounded-full bg-danger" />}
          </span>
        </div>
      ))}
    </div>
  );
}
