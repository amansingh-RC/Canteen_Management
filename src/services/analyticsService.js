import { mockRequest } from "@/services/apiClient";
import { users, usersById } from "@/data/users";
import { buildUserDetail } from "@/data/userDetail";

export function getRecentSearches() {
  return mockRequest(() =>
    users.slice(0, 5).map((u, i) => ({
      query: i % 2 === 0 ? u.id : u.name.split(" ")[0],
      matchedUser: u.name,
      employeeId: u.id,
      // department: u.department,
    }))
  );
}

export function getUserDetail(query, monthKey) {
  return mockRequest(() => {
    const user = resolveUser(query) || users[0];
    return { query, ...buildUserDetail(user, monthKey) };
  });
}

function resolveUser(query) {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  if (usersById.has(query.trim().toUpperCase())) {
    return usersById.get(query.trim().toUpperCase());
  }

  return users.find((u) => u.name.toLowerCase().includes(q)) || null;
}
