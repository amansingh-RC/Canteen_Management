import { apiRequest, mockRequest, USE_MOCK } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { reportTypes, exportHistory } from "@/data/reports";

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

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
