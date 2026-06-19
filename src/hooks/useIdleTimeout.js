import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

/**
 * Call `onIdle` after `timeout` ms with no user activity.
 *
 * The callback is held in a ref so changing its identity doesn't re-subscribe
 * the listeners, and resets are throttled so a busy mousemove stream stays cheap.
 *
 * @param {Function} onIdle
 * @param {object}   options
 * @param {number}   options.timeout  inactivity window in ms
 * @param {boolean}  options.enabled  only arm the timer while true (e.g. logged in)
 */
export function useIdleTimeout(onIdle, { timeout, enabled }) {
  const onIdleRef = useRef(onIdle);
  // Keep the latest callback without re-subscribing listeners (update in effect,
  // never during render).
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return undefined;

    let timerId;
    let lastReset = 0;

    const arm = () => {
      timerId = setTimeout(() => onIdleRef.current(), timeout);
    };

    const reset = () => {
      const now = Date.now();
      if (now - lastReset < 1000) return; // throttle: at most once/sec
      lastReset = now;
      clearTimeout(timerId);
      arm();
    };

    arm();
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, reset, { passive: true })
    );

    return () => {
      clearTimeout(timerId);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, reset));
    };
  }, [timeout, enabled]);
}
