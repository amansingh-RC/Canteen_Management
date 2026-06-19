import { mockRequest } from "@/services/apiClient";
import { users } from "@/data/users";

/**
 * Paginated, filtered user list — mirrors a real paginated API.
 * @returns {{ items, total, page, pageSize, totalPages }}
 */
export function getUsers({ page = 1, pageSize = 12, search, category, status } = {}) {
  return mockRequest(() => {
    const filtered = users.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.id.toLowerCase().includes(q)) return false;
      }
      if (category && category !== "All" && u.category !== category) return false;
      if (status && status !== "All" && u.statusLabel !== status) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: filtered.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  });
}
