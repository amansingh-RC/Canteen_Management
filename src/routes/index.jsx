import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
// import DashboardPage from "@/pages/DashboardPage";
import LiveMonitoringPage from "@/pages/LiveMonitoringPage";
import UserManagementPage from "@/pages/UserManagementPage";
import BulkUploadPage from "@/pages/BulkUploadPage";
// import CouponManagementPage from "@/pages/CouponManagementPage";
// import FaceVerificationPage from "@/pages/FaceVerificationPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import UserDetailPage from "@/pages/UserDetailPage";
import ReportsPage from "@/pages/ReportsPage";
import MealTimingsPage from "@/pages/MealTimingsPage";
import SettingsPage from "@/pages/SettingsPage";
// import AuditLogsPage from "@/pages/AuditLogsPage";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // { index: true, element: <DashboardPage /> },
      { index: true, element: <LiveMonitoringPage /> },
      { path: "users", element: <UserManagementPage /> },
      { path: "bulk-upload", element: <BulkUploadPage /> },
      // { path: "coupons", element: <CouponManagementPage /> },
      // { path: "face-logs", element: <FaceVerificationPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "analytics/user", element: <UserDetailPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "meal-timings", element: <MealTimingsPage /> },
      { path: "settings", element: <SettingsPage /> },
      // { path: "audit", element: <AuditLogsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
