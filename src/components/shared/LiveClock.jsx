import { useEffect, useState } from "react";

import { formatClock } from "@/lib/format";

/** Self-contained ticking clock (HH:MM:SS). */
export function LiveClock({ className }) {
  const [time, setTime] = useState(() => formatClock());

  useEffect(() => {
    const id = setInterval(() => setTime(formatClock()), 1000);
    return () => clearInterval(id);
  }, []);

  return <span className={className}>{time}</span>;
}
