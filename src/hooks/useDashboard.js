import { useCallback, useEffect, useState } from "react";
import { connectSocket } from "@/services/socketClient";
import { getDashboard } from "@/services/dashboardService";

export function useDashboard({ pollInterval = 10000 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const load = (silent) =>
      getDashboard()
        .then((snapshot) => {
          if (!active) return;
          setData(snapshot);
          setError(null);
          if (!silent) setLoading(false);
        })
        .catch((err) => {
          if (!active) return;
          setError(err);
          if (!silent) setLoading(false);
        });

    load(false);

    // Live refresh: any backend event → re-pull today's stats.
    const socket = connectSocket();
    const onAnyEvent = () => load(true);
    socket.onAny(onAnyEvent);
    socket.on("connect", onAnyEvent);

    // Fallback poll in case the socket is down or emits nothing.
    const intervalId = pollInterval > 0 ? setInterval(() => load(true), pollInterval) : null;

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      socket.offAny(onAnyEvent);
      socket.off("connect", onAnyEvent);
    };
  }, [pollInterval, reloadToken]);

  return { data, loading, error, refetch };
}
