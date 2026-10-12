import { test, expect } from "@playwright/test";

for (const native of [false, true]) {
  test(`result sharing with ${native ? "native share" : "clipboard fallback"}`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript((native) => {
      localStorage.setItem("mtr.config", JSON.stringify({ customText: "hello world" }));
      Object.defineProperty(navigator, "share", { configurable: true, value: native ? async (data: ShareData) => { sessionStorage.setItem("shared-result", JSON.stringify(data)); } : undefined });
    }, native);
    await page.goto("/practice");
    await page.getByRole("button", { name: "custom", exact: true }).click();
    await page.getByRole("textbox", { name: "Type the words here" }).pressSequentially("hello world", { delay: 30 });
    await expect(page.getByRole("region", { name: "Test results" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Practice missed words" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "More result actions" })).toHaveCount(0);
    await expect(page.getByText("download JSON", { exact: true })).toHaveCount(0);
    await expect(page.locator(".save-hint")).toHaveText("sign in to save your results");
    await page.getByRole("button", { name: "Share result", exact: true }).click();
    if (native) {
      await expect.poll(() => page.evaluate(() => sessionStorage.getItem("shared-result"))).toContain("wpm");
    } else {
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("wpm");
      await expect(page.getByRole("status").filter({ hasText: "copied — ready to share" })).toBeVisible();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("button", { name: "Share result", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
