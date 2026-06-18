import { mockRequest } from "@/services/apiClient";
import { users } from "@/data/users";
import { coupons } from "@/data/coupons";

let derivedByUser = null;
function getDerived() {
  if (derivedByUser) return derivedByUser;
  derivedByUser = new Map();
  for (const c of coupons) {
    const entry = derivedByUser.get(c.employeeId) || { activeCoupons: 0, lastHour: -1, lastVerification: "—" };
    if (c.status === "unused") entry.activeCoupons += 1;
    if (c.status === "used" && c.verifiedHour > entry.lastHour) {
      entry.lastHour = c.verifiedHour;
      entry.lastVerification = c.verificationTime;
    }
    derivedByUser.set(c.employeeId, entry);
  }
  return derivedByUser;
}

function decorate(user) {
  const d = getDerived().get(user.id) || { activeCoupons: 0, lastVerification: "—" };
  return { ...user, activeCoupons: d.activeCoupons, lastVerification: d.lastVerification };
}

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
      // if (department && department !== "All" && u.department !== department) return false;
      if (category && category !== "All" && u.category !== category) return false;
      if (status && status !== "All" && u.statusLabel !== status) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize).map(decorate);

    return { items, total, page: safePage, pageSize, totalPages };
  });
}
