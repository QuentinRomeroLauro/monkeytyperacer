"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./context";
import { useStored } from "@/lib/store";
import { raceRequest } from "@/lib/race-client";
import { ArrowRight } from "./icons";
export function StartActivity({
  mode,
  children,
}: {
  mode: "friends" | "minute" | "quote";
  children: React.ReactNode;
}) {
  const { setConfig, user } = useApp();
  const [name] = useStored("mtr.racer-name", "");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "friends") {
        const room = await raceRequest({
          action: "create",
          name: name.trim() || user?.name || "Guest",
        });
        router.push(`/race/${room.id}`);
      } else {
        setConfig(
          mode === "minute" ? { mode: "time", time: 60 } : { mode: "quote" },
        );
        router.push(mode === "minute" ? "/practice?mode=minute" : "/practice");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setBusy(false);
    }
  }
  return (
    <div className="activity-start">
      <button className="editorial-cta" disabled={busy} onClick={start}>
        {busy ? "opening…" : children}
        <ArrowRight size={18} />
      </button>
      {error && (
        <p className="race-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
