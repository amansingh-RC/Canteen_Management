import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getAuditLogs } from "@/services/auditService";
import { ROLE_VARIANT } from "@/data/auditLogs";

export default function AuditLogsPage() {
  const { data: logs, loading, error, refetch } = useAsyncData(getAuditLogs, []);

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Activity trail · data export history · system events"
        actions={<Button variant="outline" size="sm"><Download /> Export</Button>}
      />

      <Card className="overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <DataState loading={loading} error={error} onRetry={refetch}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[log.role] ?? "secondary"}>{log.role}</Badge>
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.module}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataState>
        </div>
      </Card>
    </>
  );
}
