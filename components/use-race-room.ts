"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { raceRequest } from "@/lib/race-client";
import type { RaceEdit, RaceView } from "@/lib/race";
type Command = {
  body: Record<string, unknown>;
  resolve: (room: RaceView) => void;
  reject: (error: Error) => void;
};
export function useRaceRoom(id: string) {
  const [room, setRoom] = useState<RaceView | null>(null),
    [error, setError] = useState("");
  const current = useRef<RaceView | null>(null),
    edits = useRef<RaceEdit[]>([]),
    sequence = useRef(0);
  const commands = useRef<Command[]>([]),
    pump = useRef<() => void>(() => {});
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let cancelled = false,
      inFlight = false,
      urgent = false;
    const controller = new AbortController(),
      pending = commands.current;
    const run = async () => {
      if (cancelled) return;
      if (inFlight) {
        urgent = true;
        return;
      }
      urgent = false;
      inFlight = true;
      const command = commands.current[0],
        previous = current.current;
      const body =
        command?.body ??
        (previous?.me
          ? {
              action: "sync",
              round: previous.round,
              edits: edits.current.slice(0, 500),
            }
          : { action: "view" });
      const sent = Date.now();
      try {
        const next = await raceRequest(
          { ...body, room: id },
          AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]),
        );
        if (cancelled) return;
        setOffset(next.serverNow - (sent + Date.now()) / 2);
        if (
          !previous?.me ||
          previous.round !== next.round ||
          previous.me.id !== next.me?.id
        ) {
          edits.current = [];
          sequence.current = next.me?.seq ?? 0;
        } else {
          edits.current = edits.current.filter(
            (e) => e.seq > (next.me?.seq ?? 0),
          );
          sequence.current = Math.max(sequence.current, next.me?.seq ?? 0);
        }
        current.current = next;
        setRoom(next);
        setError("");
        if (command) {
          commands.current.shift();
          command.resolve(next);
        }
      } catch (e) {
        if (cancelled) return;
        const failure =
          e instanceof Error ? e : new Error("Connection interrupted.");
        setError(
          failure.name === "TimeoutError"
            ? "Connection is slow. Reconnecting…"
            : failure.message,
        );
        if (command) {
          commands.current.shift();
          command.reject(failure);
        }
      } finally {
        inFlight = false;
        if (!cancelled && (commands.current.length || urgent))
          queueMicrotask(run);
      }
    };
    pump.current = () => {
      void run();
    };
    void run();
    const interval = setInterval(run, 900);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
      pending.splice(0).forEach((c) => c.reject(new Error("Room closed.")));
    };
  }, [id]);
  const action = useCallback(
    (body: Record<string, unknown>) =>
      new Promise<RaceView>((resolve, reject) => {
        commands.current.push({ body, resolve, reject });
        pump.current();
      }),
    [],
  );
  const edit = useCallback(
    (type: RaceEdit["type"], text?: string, flush = false) => {
      edits.current.push({ seq: ++sequence.current, type, text });
      if (flush) pump.current();
    },
    [],
  );
  return { room, error, action, edit, offset };
}
