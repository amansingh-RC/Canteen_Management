import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getRecentSearches } from "@/services/analyticsService";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: recent, loading, error, refetch } = useAsyncData(getRecentSearches, []);

  const search = () => navigate(`/analytics/user?q=${encodeURIComponent(query)}`);

  return (
    <>
      <PageHeader
        title="User Analytics"
        description="Search a user by coupon code, employee ID, or name"
      />

      <Card>
        <CardContent className="space-y-2.5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="min-w-64 flex-1"
              placeholder="e.g. BK20230001 · EMP1043 · Rahul"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <Button onClick={search}><Search /> Search</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Search returns the user's complete monthly history. Try a coupon code like <b>BK20230001</b>.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <CardHeader><CardTitle>Recent Searches</CardTitle></CardHeader>
        <DataState loading={loading} error={error} onRetry={refetch}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Matched User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent?.map((r) => (
                <TableRow key={r.query}>
                  <TableCell className="font-semibold">{r.query}</TableCell>
                  <TableCell>{r.matchedUser} · {r.employeeId}</TableCell>
                  {/* <TableCell>{r.department}</TableCell> */}
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/analytics/user")}>
                      View <ArrowRight />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>
      </Card>
    </>
  );
}
