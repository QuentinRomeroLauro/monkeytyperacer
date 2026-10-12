"use client";
import type { useRaceEntry } from "./use-race-entry";
export function RaceEnterButton({ entry, label = "Enter a race" }: { entry: ReturnType<typeof useRaceEntry>; label?: string }) {
  const { busy, enter, isMac, heldKeys } = entry;
  return (
          <button className="race-primary" aria-keyshortcuts={isMac ? "Meta+Enter" : "Control+Enter"} disabled={!!busy} onClick={() => enter("queue")}>
            {busy === "queue" ? "Finding a race…" : label}
            <span className="race-shortcut" aria-hidden="true"><kbd className={heldKeys.modifier ? "is-pressed" : ""}>{isMac ? "⌘" : "Ctrl"}</kbd><kbd className={heldKeys.enter ? "is-pressed" : ""}>Enter</kbd></span>
          </button>
  );
}
