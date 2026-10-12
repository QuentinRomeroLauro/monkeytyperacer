"use client";
import { track } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { useApp } from "./context";
import { practiceDrills, type PracticeDrill } from "@/lib/practice-drills";
import { TypingTest } from "./typing-test";

export function PracticeSession({ minute = false, drill }: { minute?: boolean; drill?: PracticeDrill }) {
  const { setConfig } = useApp();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setConfig(drill ? { mode: "custom", customText: practiceDrills[drill].text, customRandom: false } : minute ? { mode: "time", time: 60 } : { mode: "quote" });
      if (drill) track("accuracy_drill_opened", { drill });
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [minute, drill, setConfig]);
  return ready ? <TypingTest /> : null;
}
