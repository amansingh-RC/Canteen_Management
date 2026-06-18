import {
  LayoutDashboard,
  Radio,
  Users,
  Upload,
  Ticket,
  ScanFace,
  BarChart3,
  UserSearch,
  FileText,
  Clock,
  Settings,
  ScrollText,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Operations",
    items: [
      { key: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
      // { key: "live", label: "Live Monitoring", path: "/live", icon: Radio },
      { key: "users", label: "User Management", path: "/users", icon: Users },
      { key: "bulk", label: "Bulk Upload Users", path: "/bulk-upload", icon: Upload },
      // { key: "coupons", label: "Coupon Management", path: "/coupons", icon: Ticket },
      // { key: "face", label: "Face Verification Logs", path: "/face-logs", icon: ScanFace },
      { key: "reports", label: "Reports", path: "/reports", icon: FileText },
    ],
  },
  // {
  //   label: "Insights",
  //   items: [
  //     { key: "analytics", label: "User Analytics", path: "/analytics", icon: BarChart3 },
  //     { key: "detail", label: "User Detail", path: "/analytics/user", icon: UserSearch },
  //     { key: "reports", label: "Reports", path: "/reports", icon: FileText },
  //   ],
  // },
  {
    label: "Administration",
    items: [
      { key: "timings", label: "Meal Timing Settings", path: "/meal-timings", icon: Clock },
      { key: "settings", label: "System Settings", path: "/settings", icon: Settings },
      // { key: "audit", label: "Audit Logs", path: "/audit", icon: ScrollText },
    ],
  },
];

/** Flat list of all nav items (handy for breadcrumb/title lookups). */
export const navigationItems = navigationGroups.flatMap((group) => group.items);
