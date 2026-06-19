import { RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/auth/AuthProvider";
import { router } from "@/routes";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
