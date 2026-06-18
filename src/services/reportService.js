import { mockRequest } from "@/services/apiClient";
import { reportTypes, exportHistory } from "@/data/reports";

export function getReports() {
  return mockRequest({ reportTypes, exportHistory });
}

/** Triggers a report export. No-op in mock mode. */
export function exportReport(reportKey, format, filters) {
  return mockRequest(
    { ok: true, reportKey, format, filters, url: "#" },
    { latency: 500 }
  );
}
