import { test, expect } from "@playwright/test";
test("default layout, typing, results, restart, and persistent theme", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/practice");
  await expect(
    page.getByRole("textbox", { name: "Type the words here" }),
  ).toBeFocused();
  await expect(page.getByRole("button", { name: "quote", exact: true })).toHaveClass(/selected/);
  await page.getByRole("button", { name: "words", exact: true }).click();
  await page.getByRole("button", { name: "10", exact: true }).click();
  await expect(page.locator(".word")).toHaveCount(10);
  const words = await page.locator(".word").allTextContents();
  await page
    .getByRole("textbox", { name: "Type the words here" })
    .pressSequentially(words.map((w) => w.replace(/\u200b/g, "")).join(" "), {
      delay: 12,
    });
  await expect(
    page.getByRole("region", { name: "Test results" }),
  ).toBeVisible();
  await expect(page.locator(".stat-value").first()).not.toHaveText("0");
  await page.route("**/api/race", route=>route.fulfill({status:503,json:{error:"Test race entry"}}));
  await page.getByRole("button",{name:"Enter a race",exact:true}).click();
  await expect(page.locator(".practice-entry-error")).toContainText("Test race entry");
  await page
    .getByRole("button", { name: "words history", exact: false })
    .click();
  await expect(page.locator(".words-history .incorrect")).toHaveCount(0);
  await page.getByRole("button", { name: "Repeat test", exact: true }).click();
  await expect(page.locator(".word")).toHaveCount(10);
  expect(await page.locator(".word").allTextContents()).toEqual(words);
  await page.keyboard.press("Escape");
  await page.getByRole("textbox", { name: "Search command" }).fill("theme");
  await page.keyboard.press("Enter");
  await page.getByRole("textbox", { name: "Search theme" }).fill("nord");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "nord", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "nord", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("custom text and error correction", async ({ page }) => {
  await page.goto("/practice");
  await page.getByRole("button", { name: "custom", exact: true }).click();
  await page.getByRole("button", { name: "change", exact: false }).click();
  await page
    .getByRole("textbox", { name: "Custom text", exact: true })
    .fill("hello world");
  await page.getByRole("button", { name: "apply", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Type the words here" });
  await input.pressSequentially("x");
  await expect(page.locator(".word .incorrect")).toHaveText(
    "x".replace("x", "h"),
  );
  await input.press("Backspace");
  await input.pressSequentially("hello world", { delay: 80 });
  await expect(
    page.getByRole("region", { name: "Test results" }),
  ).toBeVisible();
  await expect(page.locator(".stat-value").nth(1)).not.toHaveText("100%");
});
test("time expires and zen ends only on shift enter", async ({ page }) => {
  await page.goto("/practice");
  await page.getByRole("button", { name: "time", exact: true }).click();
  await page.getByRole("button", { name: "Custom test length" }).click();
  await page.getByRole("spinbutton", { name: "Test length" }).fill("2");
  await page.getByRole("button", { name: "apply" }).click();
  await page
    .getByRole("textbox", { name: "Type the words here" })
    .pressSequentially("test");
  await expect(page.getByRole("region", { name: "Test results" })).toBeVisible({
    timeout: 5000,
  });
  await page.getByRole("button", { name: "Next test" }).click();
  await page.getByRole("button", { name: "zen", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Type the words here" })
    .pressSequentially("hello world", { delay: 20 });
  await page.keyboard.press("Shift+Enter");
  await expect(
    page.getByRole("region", { name: "Test results" }),
  ).toBeVisible();
});
test("settings and mobile viewport remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/practice");
  await expect(
    page.getByRole("button", { name: "words", exact: true }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "settings", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Font family" })
    .selectOption("JetBrains Mono");
  await page.goto("/practice");
  await expect(page.locator(".words-container")).toHaveCSS(
    "font-family",
    /JetBrains Mono/,
  );
});
