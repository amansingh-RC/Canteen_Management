import { apiRequest, mockRequest, USE_MOCK } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { reportTypes, exportHistory } from "@/data/reports";

/** "2026-06-01" → "01 Jun 2026" (falls back to the raw value). */
function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Human-readable summary of the active filter selection, shown on each report. */
function describeScope(filters = {}) {
  const parts = [];
  if (filters.from && filters.to) {
    parts.push(`${formatDate(filters.from)} – ${formatDate(filters.to)}`);
  }
  ["category", "meal", "status"].forEach((key) => {
    if (filters[key] && filters[key] !== "All") parts.push(filters[key]);
  });
  return parts.length ? parts.join(" · ") : "All data";
}

/**
 * Reports tailored to the applied filters. Each report carries a `scope` string
 * describing the selection it will be generated for. Backend swap:
 * `return apiRequest("/reports", { method: "POST", body: filters })`.
 */
export function getReports(filters = {}) {
  if (!USE_MOCK) {
    return apiRequest(ENDPOINTS.reports, { method: "POST", body: filters });
  }
  return mockRequest(() => {
    const scope = describeScope(filters);
    return {
      reportTypes: reportTypes.map((report) => ({ ...report, scope })),
      exportHistory,
      appliedFilters: filters,
    };
  });
}

/** Triggers a report export. No-op in mock mode. */
export function exportReport(reportKey, format, filters) {
  if (!USE_MOCK) {
    return apiRequest(ENDPOINTS.reportExport, {
      method: "POST",
      body: { reportKey, format, filters },
    });
  }
  return mockRequest(
    { ok: true, reportKey, format, filters, url: "#" },
    { latency: 500 }
  );
}
