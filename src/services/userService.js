import { apiRequest } from "@/services/apiClient";
import { ENDPOINTS } from "@/config/endpoints";

function unwrap(res) {
  return res?.data ?? res;
}

function normalizeUser(raw = {}) {
  const active = raw.isActive !== false;
  return {
    id: raw.userId,
    name: raw.name ?? "",
    category: raw.departmentName ?? raw.department ?? "—",
    status: active ? "active" : "disabled",
    statusLabel: active ? "Active" : "Disabled",
  };
}

/**
 * @returns {{ items, total, page, pageSize, totalPages }}
 */
export async function getUsers({ page = 1, pageSize = 12, search, category, status } = {}) {
  const data = unwrap(await apiRequest(ENDPOINTS.users));
  let items = (Array.isArray(data) ? data : []).map(normalizeUser);

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (u) => u.name.toLowerCase().includes(q) || String(u.id).toLowerCase().includes(q)
    );
  }
  if (category && category !== "All") items = items.filter((u) => u.category === category);
  if (status && status !== "All") items = items.filter((u) => u.statusLabel === status);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
