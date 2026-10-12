import { beforeEach, expect, it, vi } from "vitest";
const sdk = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn(), identify: vi.fn(), reset: vi.fn(), get_property: vi.fn(), opt_out_capturing: vi.fn(), opt_in_capturing: vi.fn() }));
vi.mock("posthog-js", () => ({ default: sdk }));
beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
  const store = new Map<string, string>();
  const storage = { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) };
  vi.stubGlobal("window", {}); vi.stubGlobal("localStorage", storage); vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("navigator", { doNotTrack: "0" });
  vi.stubGlobal("location", { origin: "https://monkeytyperacer.com", pathname: "/race/private-invite" });
});
it("removes private URL and sensitive properties, including nested identity defaults", async () => {
  const { scrubAnalyticsProperties, analyticsPath, track } = await import("../lib/analytics");
  expect(analyticsPath("/race/private-id?secret=1")).toBe("/race/:id");
  expect(scrubAnalyticsProperties({ email: "secret", wpm: 55, $set_once: { $initial_current_url: "private", country: "US" } })).toEqual({ wpm: 55, $set_once: { country: "US" } });
  track("race_completed", { wpm: 55 });
  const config = sdk.init.mock.calls[0][1];
  const event = config.before_send({ properties: { $current_url: "private", $set_once: { $initial_current_url: "private" }, wpm: 55 } });
  expect(JSON.stringify(event)).not.toContain("private");
  expect(event.properties.$pathname).toBe("/race/:id");
  expect(config.disable_session_recording).toBe(true);
  expect(config.autocapture).toBe(false);
});
it("deduplicates lifecycle events across polls and component remounts", async () => {
  const { trackOnce } = await import("../lib/analytics");
  trackOnce("race_completed", "room:1:me", { wpm: 80 });
  trackOnce("race_completed", "room:1:me", { wpm: 80 });
  trackOnce("race_completed", "room:2:me", { wpm: 80 });
  expect(sdk.capture).toHaveBeenCalledTimes(2);
  expect(JSON.stringify(sdk.capture.mock.calls)).not.toContain("room:");
});
it("honors opt-out and Do Not Track without initializing PostHog", async () => {
  localStorage.setItem("mtr.analytics-disabled", "true");
  const { track } = await import("../lib/analytics");
  track("warmup_started"); expect(sdk.init).not.toHaveBeenCalled();
  localStorage.setItem("mtr.analytics-disabled", "false");
  vi.stubGlobal("navigator", { doNotTrack: "1" });
  track("warmup_started"); expect(sdk.init).not.toHaveBeenCalled();
});
it("does not interrupt the app when analytics throws", async () => {
  sdk.capture.mockImplementationOnce(() => { throw Error("network"); });
  const { track } = await import("../lib/analytics");
  expect(() => track("warmup_started")).not.toThrow();
});
