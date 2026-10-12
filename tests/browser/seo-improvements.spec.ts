import { test, expect } from "@playwright/test";

test("calculator supports elapsed seconds and rejects invalid values", async ({ page }) => {
  await page.goto("/guides/how-is-typing-wpm-calculated");
  const answer = page.getByLabel("Calculated WPM");
  await expect(answer).toHaveText("60");
  await page.getByLabel("Elapsed seconds").fill("30");
  await expect(answer).toHaveText("120");
  await page.getByLabel("Elapsed seconds").fill("0");
  await expect(answer).toHaveText("—");
  await page.getByLabel("Elapsed seconds").fill("60");
  await page.getByLabel("Eligible characters").fill("");
  await expect(answer).toHaveText("—");
  await page.getByLabel("Eligible characters").fill("0");
  await expect(answer).toHaveText("0");
});

test("accuracy links open deterministic drills and missed words can be retried", async ({ page }) => {
  await page.goto("/guides/improve-typing-accuracy");
  await page.getByRole("link", { name: "practice capitals →", exact: true }).click();
  await expect(page.getByRole("button", { name: "custom", exact: true })).toHaveClass(/selected/);
  await expect(page.locator(".word").first()).toHaveText("Alice");
  const words = (await page.locator(".word").allTextContents()).map(w => w.replace(/\u200b/g, ""));
  const input = page.getByRole("textbox", { name: "Type the words here" });
  await input.pressSequentially("Xlice " + words.slice(1).join(" "), { delay: process.env.SEO_CAPTURE === "1" ? 140 : 10 });
  await expect(page.getByRole("region", { name: "Test results" })).toBeVisible();
  if (process.env.SEO_CAPTURE === "1") await page.getByRole("region", { name: "Test results" }).screenshot({ path: "public/guides/missed-words.jpg", type: "jpeg", quality: 90 });
  await page.getByRole("button", { name: "practice missed words", exact: true }).click();
  await expect(page.locator(".word")).toHaveCount(1);
  await expect(page.locator(".word")).toHaveText("Alice");
  await input.pressSequentially("Alice", { delay: 20 });
  await expect(page.getByRole("region", { name: "Test results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "practice missed words", exact: true })).toHaveCount(0);
});

test("direct quote practice completes in place without joining a race", async ({ page }) => {
  let joins = 0;
  await page.route("**/api/race", async route => { joins++; await route.fulfill({ status: 503, json: { error: "Unexpected race request" } }); });
  await page.goto("/quote-typing-practice");
  await page.getByRole("button", { name: "short", exact: true }).click();
  await expect(page.locator(".word").first()).toBeVisible();
  const input = page.getByRole("textbox", { name: "Type the words here" });
  const words = (await page.locator(".word").allTextContents()).map(w => w.replace(/\u200b/g, ""));
  await input.pressSequentially(words.join(" "), { delay: 10 });
  await expect(page.getByRole("region", { name: "Test results" })).toBeVisible();
  await expect(page).toHaveURL(/\/quote-typing-practice$/);
  expect(joins).toBe(0);
});
