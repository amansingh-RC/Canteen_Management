import { useCallback, useEffect, useState } from "react";

/**
 * Run an async service function and track loading/error/data.
 *
 * @param {Function} fetcher  async function returning the data
 * @param {Array}    deps     re-run when these change (like useEffect deps)
 * @param {object}   [options]
 * @param {number}   [options.pollInterval]  ms; when > 0, silently refetches on
 *                   an interval (no loading flicker) — used by live screens.
 
 */
export function useAsyncData(fetcher, deps = [], { pollInterval = 0 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Imperative reload (e.g. a Retry button). Safe to call from event handlers.
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let active = true;

    // `silent` polls update data in the background without toggling loading.
    const run = (silent) =>
      Promise.resolve()
        .then(() => fetcher())
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

    const intervalId = pollInterval > 0 ? setInterval(() => run(true), pollInterval) : null;

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [...deps, reloadToken, pollInterval]);

  return { data, loading, error, refetch };
}
