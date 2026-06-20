import { useEffect, useState } from "react";
import { USE_MOCK } from "@/services/apiClient";
import { getSocket } from "@/services/socketClient";

/**
 * Tracks the shared Socket.IO connection health for status indicators.
 *
 * Returns one of:
 *   "mock"        — no backend (VITE_USE_MOCK=true); nothing to connect.
 *   "connected"   — socket is connected and receiving.
 *   "connecting"  — connecting or attempting to reconnect.
 *   "disconnected"— dropped and not currently retrying.
 */
export function useSocketStatus() {
  // Seed lazily from the current socket state (it may already be connected if
  // another screen opened it) — avoids a synchronous setState in the effect.
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
