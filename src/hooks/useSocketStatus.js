import { useEffect, useState } from "react";
import { USE_MOCK } from "@/services/apiClient";
import { getSocket } from "@/services/socketClient";

export function useSocketStatus() {
  const [status, setStatus] = useState(() => {
    if (USE_MOCK) return "mock";
    return getSocket().connected ? "connected" : "connecting";
  });

  useEffect(() => {
    if (USE_MOCK) return; // nothing to track in mock mode

    const socket = getSocket();
    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onConnecting = () => setStatus("connecting");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    // Manager-level reconnection lifecycle.
    socket.io.on("reconnect_attempt", onConnecting);
    socket.io.on("reconnect_failed", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onConnecting);
      socket.io.off("reconnect_failed", onDisconnect);
    };
  }, []);

  return status;
}
