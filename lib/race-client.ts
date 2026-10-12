import type { RaceView } from "./race";
export async function raceRequest(
  body: object,
  signal?: AbortSignal,
): Promise<RaceView> {
  const response = await fetch("/api/race", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "Unable to connect to the race.");
  return data;
}
