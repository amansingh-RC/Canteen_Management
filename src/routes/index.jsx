import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import LiveMonitoringPage from "@/pages/LiveMonitoringPage";
import UserManagementPage from "@/pages/UserManagementPage";
import UserDetailPage from "@/pages/UserDetailPage";
import ReportsPage from "@/pages/ReportsPage";
import AdminManagementPage from "@/pages/AdminManagementPage";
import MealTimingsPage from "@/pages/MealTimingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <LiveMonitoringPage /> },
          { path: "users", element: <UserManagementPage /> },
          { path: "analytics/user", element: <UserDetailPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "admins", element: <AdminManagementPage /> },
          { path: "meal-timings", element: <MealTimingsPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
