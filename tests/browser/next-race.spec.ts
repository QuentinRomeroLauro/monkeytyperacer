import { test, expect } from "@playwright/test";
import { raceView, type RaceState, type Racer } from "../../lib/race";

for (const kind of ["private", "public"] as const) {
  test(`${kind} finish screen joins next race while others finish and recovers from errors`, async ({ page }) => {
    const now = Date.now();
    const player = (id: string, finished: boolean): Racer => ({ id, session: id, name: id === "you" ? "Speedy Panda" : "Host", ready: true, joinedAt: now - 40000, seenAt: now, typed: finished ? "A short quote." : "A", samples: [], seq: 0, attempts: 14, errors: 0, finishedAt: finished ? now - 1000 : null, left: false });
    const state: RaceState = { id: "finished-room", kind, phase: "racing", host: "host", round: 1, quote: "A short quote.", source: "Test book", createdAt: now - 40000, startAt: now - 30000, deadline: now + 60000, players: [player("you", true), player("host", false)] };
    let queueCalls = 0;
    await page.route("**/api/race", async route => {
      const body = route.request().postDataJSON();
      if (body.action === "queue") {
        expect(body.name).toBe("Speedy Panda");
        queueCalls++;
        if (queueCalls === 1) {
          await route.fulfill({ status: 503, json: { error: "Please try again." } });
          return;
        }
      }
      const next = body.action === "queue" || body.room === "next-room";
      await route.fulfill({ json: raceView(next ? { ...state, id: "next-room", kind: "public", phase: "waiting", startAt: null, deadline: null, players: [player("you", false)] } : state, "you", Date.now()) });
    });
    await page.goto("/race/finished-room");
    await expect(page.getByLabel("Race results")).toBeVisible();
    await expect(page.getByText("still racing", { exact: true })).toBeVisible();
    const next = page.getByRole("button", { name: "Next race", exact: true });
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.locator(".race-error[role=alert]")).toContainText("Please try again.");
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page).toHaveURL(/\/race\/next-room$/);
    expect(queueCalls).toBe(2);
  });
}
