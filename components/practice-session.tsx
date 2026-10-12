"use client";
import { useEffect, useState } from "react";
import { useApp } from "./context";
import { TypingTest } from "./typing-test";

export function PracticeSession({ minute = false }: { minute?: boolean }) {
  const { setConfig } = useApp();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setConfig(minute ? { mode: "time", time: 60 } : { mode: "quote" });
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [minute, setConfig]);
  return ready ? <TypingTest /> : null;
}
