import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("SEO pages expose distinct metadata and only stable URLs enter the sitemap", async ({
  request,
}) => {
  const paths = [
    "/",
    "/practice",
    "/guides",
    "/typing-race-with-friends",
    "/1-minute-typing-test",
    "/quote-typing-practice",
    "/guides/how-is-typing-wpm-calculated",
    "/guides/improve-typing-accuracy",
    "/guides/host-a-typing-race-with-friends",
  ];
  const titles = new Set<string>();
  for (const path of paths) {
    const r = await request.get(path);
    expect(r.ok()).toBeTruthy();
    const html = await r.text();
    expect(html).toContain(
      `rel="canonical" href="https://monkeytyperacer.com${path === "/" ? "" : path}"`,
    );
    expect(html).toContain('property="og:image"');
    titles.add(html.match(/<title>(.*?)<\/title>/)![1]);
  }
  expect(titles.size).toBe(paths.length);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/guides/improve-typing-accuracy");
  expect(sitemap).not.toMatch(/\/(race|account|login|settings)[/<]/);
  for (const path of ["/account", "/login", "/settings", "/race/example"])
    expect(await (await request.get(path)).text()).toContain(
      'content="noindex, follow"',
    );
  const card = await request.get("/social-card");
  expect(card.ok()).toBeTruthy();
  expect(card.headers()["content-type"]).toContain("image/png");
  expect((await request.get("/guides/not-a-guide")).status()).toBe(404);
});

test("search landing pages launch the promised practice mode and fit mobile", async ({
  page,
}) => {
  await page.goto("/1-minute-typing-test");
  await expect(page.getByRole("textbox", { name: "Type the words here" })).toBeVisible();
  await expect(page).toHaveURL(/\/1-minute-typing-test$/);
  await expect(
    page.getByRole("button", { name: "time", exact: true }),
  ).toHaveClass(/selected/);
  await expect(
    page.getByRole("button", { name: "60", exact: true }),
  ).toHaveClass(/selected/);
  await page.goto("/quote-typing-practice");
  await expect(page.getByRole("textbox", { name: "Type the words here" })).toBeVisible();
  await expect(page).toHaveURL(/\/quote-typing-practice$/);
  await expect(
    page.getByRole("button", { name: "quote", exact: true }),
  ).toHaveClass(/selected/);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/guides",
    "/quote-typing-practice",
    "/1-minute-typing-test",
    "/guides/how-is-typing-wpm-calculated",
    "/typing-race-with-friends",
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const img of await page.locator(".product-window img").all())
      await expect(img).toHaveJSProperty("complete", true);
  }
});

test("finished races export a PNG, copy a result, and create a fresh challenge room", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const now = Date.now();
  const player = {
    id: "me",
    name: "Example racer",
    ready: true,
    joinedAt: now - 60000,
    seenAt: now,
    seq: 1,
    attempts: 100,
    errors: 2,
    finishedAt: now - 1000,
    left: false,
    progress: 1,
    wpm: 84,
    accuracy: 98,
  };
  const room = {
    id: "completed",
    kind: "private",
    phase: "finished",
    host: "me",
    round: 1,
    quote: "A little friendly competition.",
    source: "Example",
    createdAt: now - 60000,
    startAt: now - 31000,
    deadline: now + 60000,
    players: [player],
    me: {
      id: "me",
      typed: "A little friendly competition.",
      seq: 1,
      samples: [],
    },
    serverNow: now,
  };
  let creates = 0;
  await page.route("**/api/race", async (route) => {
    const body = route.request().postDataJSON();
    if (body.action === "create") {
      creates++;
      await route.fulfill({
        json: {
          ...room,
          id: "new-challenge",
          phase: "waiting",
          quote: "",
          startAt: null,
          players: [{ ...player, finishedAt: null }],
        },
      });
    } else await route.fulfill({ json: { ...room, serverNow: Date.now() } });
  });
  await page.goto("/race/completed");
  await page.getByRole("button", { name: "share result", exact: true }).click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.getByRole("button", { name: "copy result", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("84 WPM with 98% accuracy");
  expect(
    await page.evaluate(() => navigator.clipboard.readText()),
  ).not.toContain("/race/completed");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "download card" }).click();
  const file = await downloading;
  const bytes = await readFile((await file.path())!);
  expect(bytes.subarray(1, 4).toString()).toBe("PNG");
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.getByRole("dialog", { name: "command" })).toHaveCount(0);
  await page.getByRole("button", { name: "share result", exact: true }).click();
  await page.getByRole("button", { name: "challenge a friend" }).click();
  await expect(page).toHaveURL(/\/race\/new-challenge$/);
  expect(creates).toBe(1);
});

test("incomplete races do not offer a finished result card", async ({
  page,
}) => {
  await page.route("**/api/race", (route) =>
    route.fulfill({
      json: {
        id: "unfinished",
        kind: "private",
        phase: "finished",
        host: "me",
        round: 1,
        quote: "hi",
        source: "Example",
        createdAt: 0,
        startAt: 1,
        deadline: 2,
        players: [
          {
            id: "me",
            name: "Guest",
            finishedAt: null,
            progress: 0,
            seenAt: Date.now(),
            wpm: 0,
            accuracy: 100,
          },
        ],
        me: { id: "me", typed: "", seq: 0, samples: [] },
        serverNow: Date.now(),
      },
    }),
  );
  await page.goto("/race/unfinished");
  await expect(page.getByLabel("Race results")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "share result", exact: true }),
  ).toHaveCount(0);
});
