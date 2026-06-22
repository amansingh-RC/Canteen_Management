import { useCallback, useEffect, useState } from "react";
import { USE_MOCK } from "@/services/apiClient";
import { connectSocket } from "@/services/socketClient";
import { getLiveMonitoring } from "@/services/liveService";
import { buildLiveSnapshot } from "@/lib/liveTransform";

const SNAPSHOT_EVENT = "live:monitoring";
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

    getLiveMonitoring()
      .then((snapshot) => {
        if (!active) return;
        setData(snapshot);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;

        setError(err);
        setLoading(false);
      });

    const socket = connectSocket();

    const onSnapshot = (payload) => {
      if (!active) return;
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
