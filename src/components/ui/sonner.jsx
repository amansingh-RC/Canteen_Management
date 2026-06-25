import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/hooks/useTheme";

export function Toaster(props) {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          width: "420px",
          padding: "16px 18px",
          fontSize: "15px",
        },
      }}
      {...props}
    />
  );
}
