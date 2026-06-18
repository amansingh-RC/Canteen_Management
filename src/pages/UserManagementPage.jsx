import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataState } from "@/components/shared/DataState";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getUsers } from "@/services/userService";
import { formatNumber } from "@/lib/format";
import { USER_CATEGORIES } from "@/config/meals";

const PAGE_SIZE = 12;
const DEFAULT_FILTERS = { search: "", category: "All", status: "All" };

export default function UserManagementPage() {
  const navigate = useNavigate();
  // `draft` is the form state; `filters` is what's actually queried (on Apply).
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useAsyncData(
    () => getUsers({ ...filters, page, pageSize: PAGE_SIZE }),
    [filters, page]
  );

  const setField = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));
  const applyFilters = () => {
    setFilters(draft);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="User Management"
        description={`${formatNumber(data?.total ?? 0)} users across both categories`}
        actions={
          <>
            <Button variant="outline" size="sm"><Download /> Export</Button>
            <Button size="sm"><Plus /> Add User</Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex flex-col gap-1">
            <Label>Search</Label>
            <Input
              className="w-56"
              placeholder="Name or Employee ID"
              value={draft.search}
              onChange={(e) => setField("search")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          {/* <FilterSelect label="Department" value={draft.department} onChange={setField("department")} options={["All", ...DEPARTMENTS]} /> */}
          <FilterSelect label="Category" value={draft.category} onChange={setField("category")} options={["All", ...USER_CATEGORIES]} />
          <FilterSelect label="Status" value={draft.status} onChange={setField("status")} options={["All", "Active", "Disabled"]} />
          <Button size="sm" onClick={applyFilters}>Apply Filters</Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <DataState loading={loading} error={error} onRetry={refetch}>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  {/* <TableHead>Department</TableHead> */}
                  <TableHead>Category</TableHead>
                  <TableHead>Face Verification</TableHead>
                  <TableHead>Active Coupons</TableHead>
                  <TableHead>Last Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.length ? (
                  data.items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-semibold">{u.id}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      {/* <TableCell>{u.department}</TableCell> */}
                      <TableCell><Badge variant="info">{u.category}</Badge></TableCell>
                      <TableCell><StatusBadge status={u.faceVerification} label={u.faceVerificationLabel} /></TableCell>
                      <TableCell>{u.activeCoupons}</TableCell>
                      <TableCell className="text-muted-foreground">{u.lastVerification}</TableCell>
                      <TableCell><StatusBadge status={u.status} label={u.statusLabel} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/analytics/user?q=${u.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      No users match these filters.
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
