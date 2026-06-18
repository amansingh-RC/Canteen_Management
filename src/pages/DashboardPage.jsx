// import { Download, RefreshCw, Users, CheckCircle2, Clock, Ticket, XCircle } from "lucide-react";
// import { PageHeader } from "@/components/shared/PageHeader";
// import { KpiCard } from "@/components/shared/KpiCard";
// import { Legend } from "@/components/shared/Legend";
// import { DataState } from "@/components/shared/DataState";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { LineChart } from "@/components/charts/LineChart";
// import { DonutChart } from "@/components/charts/DonutChart";
// import { PieChart } from "@/components/charts/PieChart";
// import { StackedBarChart } from "@/components/charts/StackedBarChart";
// import { useAsyncData } from "@/hooks/useAsyncData";
// import { getDashboardOverview } from "@/services/dashboardService";
// import { formatNumber, formatPercent, ratio } from "@/lib/format";

// export default function DashboardPage() {
//   const { data, loading, error, refetch } = useAsyncData(getDashboardOverview, []);

//   return (
//     <>
//       <PageHeader
//         title="Today's Overview"
//         description="Current-day statistics · 12 June 2026"
//         actions={
//           <>
//             <Button variant="outline" size="sm">
//               <Download /> Export
//             </Button>
//             <Button size="sm" onClick={refetch}>
//               <RefreshCw /> Refresh
//             </Button>
//           </>
//         }
//       />

//       <DataState loading={loading} error={error} onRetry={refetch}>
//         {data && <Overview data={data} />}
//       </DataState>
//     </>
//   );
// }

// function Overview({ data }) {
//   const { userStats, couponStats, usageTrend, mealConsumption, mealDistribution } = data;
//   const verifiedPct = ratio(userStats.verified, userStats.totalEligible);
//   const pendingPct = ratio(userStats.pending, userStats.totalEligible);
//   const redemptionPct = ratio(couponStats.used, couponStats.generated);
//   const expiredPct = ratio(couponStats.expired, couponStats.generated);

//   return (
//     <div className="space-y-4">
//       {/* User KPIs */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <KpiCard accent="blue" icon={<Users className="size-4" />} label="Total Eligible Users" value={formatNumber(userStats.totalEligible)} delta="All categories combined" />
//         <KpiCard accent="green" icon={<CheckCircle2 className="size-4" />} label="Verified Users" value={formatNumber(userStats.verified)} delta={`${formatPercent(verifiedPct)} verified today`} />
//         <KpiCard accent="amber" icon={<Clock className="size-4" />} label="Pending Users" value={formatNumber(userStats.pending)} delta={`${formatPercent(pendingPct)} awaiting verification`} trend="down" />
//       </div>

//       {/* Coupon KPIs */}
//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <KpiCard accent="blue" icon={<Ticket className="size-4" />} label="Generated" value={formatNumber(couponStats.generated)} delta="4 meals × eligible" />
//         <KpiCard accent="green" icon={<CheckCircle2 className="size-4" />} label="Used" value={formatNumber(couponStats.used)} delta={`${formatPercent(redemptionPct)} redemption`} />
//         <KpiCard accent="amber" icon={<Clock className="size-4" />} label="Unused" value={formatNumber(couponStats.unused)} delta="Windows still open" />
//         <KpiCard accent="red" icon={<XCircle className="size-4" />} label="Expired" value={formatNumber(couponStats.expired)} delta={`${formatPercent(expiredPct)} lapsed`} trend="down" />
//       </div>

//       {/* Trend + donut */}
//       <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
//         <Card>
//           <CardHeader>
//             <div>
//               <CardTitle>Coupon Usage Trend</CardTitle>
//               <CardDescription>Hourly verification vs. coupon usage</CardDescription>
//             </div>
//             <Legend
//               items={[
//                 { label: "Verifications", color: "var(--info)" },
//                 { label: "Coupons used", color: "var(--success)" },
//               ]}
//             />
//           </CardHeader>
//           <CardContent>
//             <LineChart
//               xLabels={usageTrend.labels}
//               series={[
//                 { points: usageTrend.series.verifications, color: "var(--info)" },
//                 { points: usageTrend.series.couponsUsed, color: "var(--success)" },
//               ]}
//             />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Verification Status</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <DonutChart
//               centerValue={formatPercent(verifiedPct, { digits: 0 })}
//               centerLabel="Verified"
//               segments={[
//                 { value: verifiedPct, color: "var(--success)" },
//                 { value: pendingPct, color: "var(--warning)" },
//                 { value: 100 - verifiedPct - pendingPct, color: "var(--danger)" },
//               ]}
//             />
//             <Legend
//               className="justify-center"
//               items={[
//                 { label: `Verified ${formatNumber(userStats.verified)}`, color: "var(--success)" },
//                 { label: `Pending ${formatNumber(userStats.pending)}`, color: "var(--warning)" },
//                 { label: `Expired ${formatNumber(couponStats.expired)}`, color: "var(--danger)" },
//               ]}
//             />
//           </CardContent>
//         </Card>
//       </div>

//       {/* Meal consumption + distribution */}
//       <div className="grid gap-4 lg:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Meal-wise Consumption</CardTitle>
//             <CardDescription>Used · Unused · Expired</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <StackedBarChart
//               data={mealConsumption.map((m) => {
//                 const total = m.total || 1;
//                 const pct = (n) => Math.round((n / total) * 100);
//                 return {
//                   label: m.meal,
//                   segments: [
//                     { value: pct(m.used), color: "var(--success)" },
//                     { value: pct(m.unused), color: "var(--warning)" },
//                     { value: pct(m.expired), color: "var(--danger)" },
//                   ],
//                 };
//               })}
//             />
//             <Legend
//               className="mt-4 justify-center"
//               items={[
//                 { label: "Used", color: "var(--success)" },
//                 { label: "Unused", color: "var(--warning)" },
//                 { label: "Expired", color: "var(--danger)" },
//               ]}
//             />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Meal Distribution</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <PieChart segments={mealDistribution.map((m) => ({ value: m.value, color: m.color }))} />
//             <Legend
//               className="justify-center"
//               items={mealDistribution.map((m) => ({
//                 label: `${m.meal} ${m.value}%`,
//                 color: m.color,
//               }))}
//             />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
