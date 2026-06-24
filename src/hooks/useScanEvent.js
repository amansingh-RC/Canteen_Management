import { useEffect } from "react";
import { toast } from "sonner";
import { USE_MOCK } from "@/services/apiClient";
import { connectSocket } from "@/services/socketClient";

const SCAN_EVENT = "scan_event";

export function useScanEvent() {
  useEffect(() => {
    if (USE_MOCK) return; // no live socket in mock mode

    const socket = connectSocket();

    const handleScan = (data) => {
      // Backend payload shape: { name, userId, status, mealName? }
      const { name, userId, status } = data ?? {};
      console.log("[socket] scan_event:", data);

      if (String(status).toLowerCase() === "duplicate") {
        toast.error("Duplicate scan", {
          description: `${name} (ID: ${userId}) has already been scanned.`,
        });
      }
    };

    socket.on(SCAN_EVENT, handleScan);

    return () => {
      socket.off(SCAN_EVENT, handleScan);
    };
  }, []);
}
