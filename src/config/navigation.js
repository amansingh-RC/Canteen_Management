import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { ROLES, ALL_ROLES } from "@/config/auth";
export const navigationGroups = [
  {
    label: "Operations",
    items: [
      { key: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ALL_ROLES },
      { key: "users", label: "User Management", path: "/users", icon: Users, roles: ALL_ROLES },
      { key: "reports", label: "Reports", path: "/reports", icon: FileText, roles: ALL_ROLES },
    ],
  },
  {
    label: "Administration",
    items: [
      { key: "admins", label: "Admin Management", path: "/admins", icon: ShieldCheck, roles: [ROLES.ADMIN] },
      { key: "timings", label: "Meal Timing Settings", path: "/meal-timings", icon: Clock, roles: [ROLES.ADMIN] },
    ],
  },
];

/** Flat list of all nav items (handy for breadcrumb/title/role lookups). */
export const navigationItems = navigationGroups.flatMap((group) => group.items);

/** Navigation groups visible to a given role (empty groups removed). */
export function getNavGroupsForRole(role) {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

export function rolesForPath(pathname) {
  const exact = navigationItems.find((item) => item.path === pathname);
  if (exact) return exact.roles;
  const prefix = navigationItems
    .filter((item) => item.path !== "/" && pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return prefix ? prefix.roles : null;
}

/** First path a role is allowed to land on (used as a post-login/redirect home). */
export function firstPathForRole(role) {
  const item = navigationItems.find((i) => i.roles.includes(role));
  return item ? item.path : "/";
}
