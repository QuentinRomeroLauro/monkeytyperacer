"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./context";
import { useStored } from "@/lib/store";
import { racerName } from "@/lib/racer-name";
import { raceRequest } from "@/lib/race-client";
const subscribePlatform = () => () => {};
const readMacPlatform = () => /Mac|iPhone|iPad/.test(navigator.platform);
const serverMacPlatform = () => true;
export function useRaceEntry({ enabled = true, nameOverride }: { enabled?: boolean; nameOverride?: string } = {}) {
  const { user, modal } = useApp(), router = useRouter();
  const [name, setName] = useStored("mtr.racer-name", "");
  const [busy, setBusy] = useState(""), [error, setError] = useState("");
  const joining = useRef(false);
  const [heldKeys, setHeldKeys] = useState({ modifier: false, enter: false });
  const isMac = useSyncExternalStore(subscribePlatform, readMacPlatform, serverMacPlatform);
  const displayName = nameOverride || name || user?.name || "";
  const enter = useCallback(async (action: "queue" | "create") => {
    if (!enabled || joining.current || modal) return;
    joining.current = true;
    setBusy(action); setError("");
    try {
      const chosen = racerName(displayName);
      setName(chosen);
      const room = await raceRequest({ action, name: chosen });
      router.push(`/race/${room.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to join.");
      joining.current = false; setBusy("");
    }
  }, [enabled, modal, displayName, setName, router]);
  useEffect(() => {
    if (!enabled) return;
    const clearKeys = () => setHeldKeys({ modifier: false, enter: false });
    const updateKeys = (event: KeyboardEvent) => {
      if (modal || document.querySelector('dialog[open], [role="dialog"], :popover-open')) {
        clearKeys();
        return;
      }
      const modifier = isMac ? event.metaKey : event.ctrlKey;
      setHeldKeys(previous => {
        // macOS can omit Enter's keyup while Command is held.
        const enter = event.key === "Enter" ? event.type === "keydown"
          : event.key === (isMac ? "Meta" : "Control") && !modifier ? false : previous.enter;
        return previous.modifier === modifier && previous.enter === enter
          ? previous : { modifier, enter };
      });
    };
    const onVisibility = () => { if (document.hidden) clearKeys(); };
    const onKey = (event: KeyboardEvent) => {
      updateKeys(event);
      if (event.key !== "Enter" || event.repeat || event.isComposing || event.altKey || event.shiftKey) return;
      if (!(isMac ? event.metaKey : event.ctrlKey)) return;
      if (modal || document.querySelector('dialog[open], [role="dialog"], :popover-open')) return;
      event.preventDefault();
      void enter("queue");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", updateKeys);
    window.addEventListener("blur", clearKeys);
    document.addEventListener("visibilitychange", onVisibility);
  return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", updateKeys);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, enter, isMac, modal]);
  return { busy, error, enter, isMac, heldKeys };
}
