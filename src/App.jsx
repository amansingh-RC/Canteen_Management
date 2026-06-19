import { RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/routes";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}
