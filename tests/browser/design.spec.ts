import { test, expect } from "@playwright/test";

test("blue default and Hugeicons across primary pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "typeracer dark", exact: true })).toBeVisible();
  for (const path of ["/", "/settings", "/login", "/leaderboards"]) {
    await page.goto(path);
    await expect(page.locator('header svg[data-icon-library="hugeicons"]').first()).toBeVisible();
    expect(await page.locator('.app-shell svg:not([data-icon-library="hugeicons"]):not([data-brand-mark="mtr-roadster"])').count()).toBe(0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("legacy default upgrades and custom caret keeps the custom accent", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("mtr.config", JSON.stringify({ theme: "serika_dark", time: 60, mode: "time" })));
  await page.goto("/practice");
  await expect(page.getByRole("button", { name: "typeracer dark", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "60", exact: true })).toHaveClass(/selected/);
  await page.evaluate(() => localStorage.setItem("mtr.config", JSON.stringify({ theme: "serika_dark", customTheme: true, customColors: { bg: "#222222", main: "#abcdef", sub: "#888888", text: "#ffffff" } })));
  await page.reload();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--caret-color"))).toBe("#abcdef");
});
