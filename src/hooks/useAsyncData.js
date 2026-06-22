import { useCallback, useEffect, useState } from "react";

/**
 * @param {Function} fetcher 
 * @param {Array}    deps   
 * @param {object}   [options]
 * @param {number}   [options.pollInterval] 
 
 */
export function useAsyncData(fetcher, deps = [], { pollInterval = 0 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let active = true;

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
