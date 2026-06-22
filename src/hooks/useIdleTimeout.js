import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

/**
 * @param {Function} onIdle
 * @param {object}   options
 * @param {number}   options.timeout 
 * @param {boolean}  options.enabled  
 */
export function useIdleTimeout(onIdle, { timeout, enabled }) {
  const onIdleRef = useRef(onIdle);

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
