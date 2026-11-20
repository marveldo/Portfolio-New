"use client";

import { useEffect, useState } from "react";

export function useClock(timeZone: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  return {
    time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }),
    date: now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone }),
  };
}
