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
    const shortcut = await next.getAttribute("aria-keyshortcuts");
    await page.keyboard.press(shortcut === "Meta+Enter" ? "Meta+Enter" : "Control+Enter");
    await expect(page).toHaveURL(/\/race\/next-room$/);
    expect(queueCalls).toBe(2);
  });
}

test("unfinished racers display tied places in results and tracks", async ({ page }) => {
  const now = Date.now();
  const players: Racer[] = ["winner", "you", "tied", "last"].map((id) => ({
    id, session: id, name: id, ready: true, joinedAt: now - 40000, seenAt: now,
    typed: id === "winner" ? "A short quote." : id === "last" ? "" : "A short",
    samples: [], seq: 0, attempts: 14, errors: 0, finishedAt: id === "winner" ? now - 1000 : null, left: false,
  }));
  const state: RaceState = { id: "tied-room", kind: "public", phase: "finished", host: "winner", round: 1, quote: "A short quote.", source: "Test book", createdAt: now - 40000, startAt: now - 30000, deadline: now, players };
  await page.route("**/api/race", route => route.fulfill({ json: raceView(state, "you", now) }));
  await page.goto("/race/tied-room");
  await expect(page.locator(".race-finish-title h1")).toHaveText("you tied for 2nd");
  await expect(page.locator(".race-place-badge")).toHaveText("2nd");
  await expect(page.locator(".race-standings tbody tr td:first-child")).toHaveText(["1", "2", "2", "4"]);
  await expect(page.locator(".race-position")).toHaveText(["1", "2", "2", "4"]);
  await expect(page.locator(".race-finish-title p")).toContainText("quote unfinished");
});

test("finished quote moves attribution above the text and scrolls on desktop and mobile", async ({ page }) => {
  const now = Date.now();
  const quote = "The quiet reader turned the page and found another story waiting to be told. ".repeat(5).trim();
  const player: Racer = { id: "you", session: "you", name: "Reader", ready: true, joinedAt: now - 40000, seenAt: now, typed: quote, samples: [], seq: 0, attempts: quote.length, errors: 0, finishedAt: now - 1000, left: false };
  const state: RaceState = { id: "scroll-room", kind: "public", phase: "finished", host: "you", round: 1, quote, source: "A Book — An Author", createdAt: now - 40000, startAt: now - 30000, deadline: now, players: [player] };
  await page.route("**/api/race", route => route.fulfill({ json: raceView(state, "you", now) }));
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/race/scroll-room");
    const text = page.getByRole("region", { name: "Finished quote", exact: true });
    await expect(text).toBeVisible();
    await expect(page.locator(".race-status")).toHaveText("A Book — An Author");
    await expect(page.locator(".race-quote-stage .quote-source")).toHaveCount(0);
    expect((await page.locator(".race-status").boundingBox())!.y).toBeLessThan((await text.boundingBox())!.y);
    await text.hover();
    await page.mouse.wheel(0, 450);
    await expect.poll(() => text.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await text.focus();
    await text.press("Control+Home");
    await expect.poll(() => text.evaluate(el => el.scrollTop)).toBe(0);
  }
});

test("cars move within stable lanes, with a blue local car and places on the right", async ({ page }) => {
  const now = Date.now();
  const racer = (id: string, typed: string): Racer => ({ id, session: id, name: id, ready: true, joinedAt: now, seenAt: now, typed, samples: [], seq: 0, attempts: typed.length, errors: 0, finishedAt: null, left: false });
  const state: RaceState = { id: "car-room", kind: "public", phase: "racing", host: "you", round: 1, quote: "A short quote.", source: "Test", createdAt: now - 40000, startAt: now - 1000, deadline: now + 180000, players: [racer("you", "A"), racer("other", "A short")] };
  await page.route("**/api/race", route => route.fulfill({ json: raceView(state, "you", Date.now()) }));
  await page.goto("/race/car-room");
  const mine = page.locator('[data-racer-id="you"]');
  const other = page.locator('[data-racer-id="other"]');
  await expect(mine.locator(".race-position")).toHaveText("2");
  const initial = (await mine.locator(".race-car").boundingBox())!;
  const laneY = (await mine.boundingBox())!.y;
  const ownColor = await mine.locator(".race-car").evaluate(el => getComputedStyle(el).color);
  expect(ownColor).toBe(await mine.locator(".race-position").evaluate(el => getComputedStyle(el).color));
  expect(ownColor).not.toBe(await other.locator(".race-car").evaluate(el => getComputedStyle(el).color));
  state.players[0].typed = "A short quote";
  await expect(mine.locator(".race-position")).toHaveText("1");
  await expect.poll(async () => (await mine.locator(".race-car").boundingBox())!.x).toBeGreaterThan(initial.x + 100);
  expect((await mine.boundingBox())!.y).toBe(laneY);
  const position = (await mine.locator(".race-position").boundingBox())!;
  const car = (await mine.locator(".race-car").boundingBox())!;
  expect(position.x).toBeGreaterThan(car.x + car.width);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/race-cars-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: "/tmp/race-cars-desktop.png", fullPage: true });
});
