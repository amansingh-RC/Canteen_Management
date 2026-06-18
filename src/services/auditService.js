import { mockRequest } from "@/services/apiClient";
import { auditLogs } from "@/data/auditLogs";

export function getAuditLogs() {
  return mockRequest(auditLogs);
}
