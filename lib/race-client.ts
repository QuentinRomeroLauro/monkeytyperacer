import { track } from "./analytics";
import type { RaceView } from "./race";
export async function raceRequest(
  body: object,
  signal?: AbortSignal,
): Promise<RaceView> {
  const action = (body as { action?: string }).action;
  const measured = !!action && ["queue", "create", "join", "ready", "start", "rematch", "leave"].includes(action);
  const started = performance.now();
  if (measured) track("race_action_requested", { action: action! });
  try {
  const response = await fetch("/api/race", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "Unable to connect to the race.");
  if (measured) track("race_action_succeeded", { action: action!, race_kind: data.kind, latency_ms: Math.round(performance.now() - started), round: data.round });
  return data;
  } catch (error) {
    if (measured) track("race_action_failed", { action: action!, category: error instanceof Error && error.name === "AbortError" ? "cancelled" : "request_failed" });
    throw error;
  }
}
