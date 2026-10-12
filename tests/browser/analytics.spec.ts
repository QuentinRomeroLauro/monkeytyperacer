import { expect, test } from "@playwright/test";
import { gunzipSync } from "node:zlib";

test("analytics delivers sanitized events once and stops after opt-out", async ({ page }) => {
  test.skip(process.env.TEST_ANALYTICS !== "1", "Build with the test PostHog key and host first; see docs/analytics.md");
  const events: Array<{ event: string; properties: Record<string, unknown> }> = [];
  // The real SDK filters automated browsers. Only this test emulates a human browser.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "userAgent", { get: () => "Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36" });
    Object.defineProperty(navigator, "userAgentData", { get: () => undefined });
  });
  await page.route("https://posthog-test.invalid/**", async route => {
    const request = route.request();
    const body = request.postDataBuffer();
    if (body) {
      const raw = body[0] === 0x1f && body[1] === 0x8b ? gunzipSync(body).toString() : body.toString();
      const parsed = JSON.parse(raw);
      events.push(...(Array.isArray(parsed) ? parsed : parsed.batch ?? [parsed]));
    }
    await route.fulfill({ status: 200, json: { status: 1 } });
  });
  await page.goto("/?invite=private-test&email=private@example.com");
  await page.getByRole("textbox", { name: "Type the quote", exact: true }).pressSequentially("~");
  await expect.poll(() => events.map(event => event.event)).toContain("warmup_started");
  expect(events.filter(event => event.event === "$pageview")).toHaveLength(1);
  expect(events.filter(event => event.event === "warmup_started")).toHaveLength(1);
  expect(JSON.stringify(events)).not.toContain("private-test");
  expect(JSON.stringify(events)).not.toContain("private@example.com");
  await page.goto("/privacy");
  await page.getByRole("button", { name: "Disable product analytics", exact: true }).click();
  // Allow any in-flight pre-opt-out request to finish before establishing the baseline.
  await page.waitForTimeout(3500);
  const before = events.length;
  await page.goto("/");
  await page.getByRole("textbox", { name: "Type the quote", exact: true }).pressSequentially("~");
  await page.waitForTimeout(3500);
  expect(events).toHaveLength(before);
});
