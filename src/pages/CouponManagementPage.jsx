import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Pagination } from "@/components/shared/Pagination";
import { KpiCard } from "@/components/shared/KpiCard";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCoupons, getCouponStats } from "@/services/couponService";
import { formatNumber } from "@/lib/format";
import { MEALS, USER_CATEGORIES } from "@/config/meals";

const PAGE_SIZE = 12;
const DEFAULT_FILTERS = { date: "2026-06-12", meal: "All", category: "All", status: "All" };

export default function CouponManagementPage() {
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const stats = useAsyncData(getCouponStats, []);
  const { data, loading, error, refetch } = useAsyncData(
    () => getCoupons({ ...filters, page, pageSize: PAGE_SIZE }),
    [filters, page]
  );

  const setField = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));
  const applyFilters = () => {
    setFilters(draft);
    setPage(1);
  };

  const summary = stats.data?.summary;

  return (
    <>
      <PageHeader
        title="Coupon Management"
        description="All generated coupons across meals"
        actions={<Button variant="outline" size="sm"><Download /> Export</Button>}
      />

      {summary && (
        <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard accent="blue" label="Generated" value={formatNumber(summary.generated)} />
          <KpiCard accent="green" label="Used" value={formatNumber(summary.used)} />
          <KpiCard accent="amber" label="Unused" value={formatNumber(summary.unused)} />
          <KpiCard accent="red" label="Expired" value={formatNumber(summary.expired)} />
        </div>
      )}

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex flex-col gap-1">
            <Label>Date</Label>
            <Input type="date" className="w-44" value={draft.date} onChange={(e) => setField("date")(e.target.value)} />
          </div>
          <FilterSelect label="Meal Type" value={draft.meal} onChange={setField("meal")} options={["All", ...MEALS.map((m) => m.label)]} />
          <FilterSelect label="User Category" value={draft.category} onChange={setField("category")} options={["All", ...USER_CATEGORIES]} />
          <FilterSelect label="Status" value={draft.status} onChange={setField("status")} options={["All", "Used", "Unused", "Expired"]} />
          <Button size="sm" onClick={applyFilters}>Apply</Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <DataState loading={loading} error={error} onRetry={refetch}>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Meal Type</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Verification Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.length ? (
                  data.items.map((c) => (
                    <TableRow key={c.code}>
                      <TableCell className="font-semibold">{c.code}</TableCell>
                      <TableCell>{c.userName}</TableCell>
                      <TableCell>{c.meal}</TableCell>
                      <TableCell className="text-muted-foreground">{c.generatedOn}</TableCell>
                      <TableCell className="text-muted-foreground">{c.verificationTime}</TableCell>
                      <TableCell><StatusBadge status={c.status} label={c.statusLabel} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No coupons match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {data && (
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </DataState>
      </Card>
    </>
  );
}
