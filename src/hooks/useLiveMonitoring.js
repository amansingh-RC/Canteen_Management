import { useCallback, useEffect, useState } from "react";
import { USE_MOCK } from "@/services/apiClient";
import { connectSocket } from "@/services/socketClient";
import { getLiveMonitoring } from "@/services/liveService";
import { buildLiveSnapshot } from "@/lib/liveTransform";

// Server → client: a fresh live-monitoring snapshot is pushed on this event.
const SNAPSHOT_EVENT = "live:monitoring";
// Client → server: ask to start / stop receiving snapshots for this screen.
const SUBSCRIBE_EVENT = "live:subscribe";
const UNSUBSCRIBE_EVENT = "live:unsubscribe";

export function useLiveMonitoring({ pollInterval = 3000 } = {}) {
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

    // ── Mock mode: poll the local service (no backend yet) ──────────────────
    if (USE_MOCK) {
      const run = (silent) =>
        getLiveMonitoring()
          .then((result) => {
            if (!active) return;
            setData(result);
            if (!silent) setLoading(false);
          })
          .catch((err) => {
            if (!active) return;
            setError(err);
            if (!silent) setLoading(false);
          });

      run(false);
      const intervalId =
        pollInterval > 0 ? setInterval(() => run(true), pollInterval) : null;

      return () => {
        active = false;
        if (intervalId) clearInterval(intervalId);
      };
    }

    // ── Backend mode: REST for first paint, then Socket.IO for live pushes ──
    // Fetch the current snapshot so the page isn't blank until the first event.
    getLiveMonitoring()
      .then((snapshot) => {
        if (!active) return;
        setData(snapshot);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        // Don't surface as a hard error — the socket may still deliver data.
        setError(err);
        setLoading(false);
      });

    const socket = connectSocket();

    const onSnapshot = (payload) => {
      if (!active) return;
      // Backend pushes RAW counts; derive the display shape on the client.
      setData(buildLiveSnapshot(payload));
      setError(null);
      setLoading(false);
    };

    const onConnectError = (err) => {
      if (!active) return;
      setError(err);
      setLoading(false);
    };

    socket.on(SNAPSHOT_EVENT, onSnapshot);
    socket.on("connect_error", onConnectError);

    // Tell the server we want updates (re-emit on reconnect too).
    const subscribe = () => socket.emit(SUBSCRIBE_EVENT);
    socket.on("connect", subscribe);
    if (socket.connected) subscribe();

    return () => {
      active = false;
      socket.emit(UNSUBSCRIBE_EVENT);
      socket.off(SNAPSHOT_EVENT, onSnapshot);
      socket.off("connect_error", onConnectError);
      socket.off("connect", subscribe);
    };
  }, [pollInterval, reloadToken]);

  return { data, loading, error, refetch };
}
