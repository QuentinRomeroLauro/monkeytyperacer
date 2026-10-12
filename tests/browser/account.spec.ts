import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
test("Neon registration, persisted results, session login, settings, and deletion", async ({
  page,
}) => {
  const suffix = randomBytes(5).toString("hex"),
    email = `test-${suffix}@example.com`,
    name = `test_${suffix}`,
    password = `Test!${randomBytes(16).toString("hex")}`;
  let created = false;
  try {
    await page.goto("/login");
    await page
      .getByRole("textbox", { name: "Username", exact: true })
      .fill(name);
    await page.getByRole("textbox", { name: "Registration email" }).fill(email);
    await page
      .getByRole("textbox", { name: "Verify email", exact: true })
      .fill(email);
    await page
      .getByRole("textbox", { name: "Registration password" })
      .fill(password);
    await page
      .getByRole("textbox", { name: "Verify password", exact: true })
      .fill(password);
    await page.getByRole("button", { name: "sign up", exact: true }).click();
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible({
      timeout: 15000,
    });
    created = true;
    await page.goto("/practice");
    await page.getByRole("button", { name: "custom", exact: true }).click();
    await page.getByRole("button", { name: "change", exact: false }).click();
    await page
      .getByRole("textbox", { name: "Custom text", exact: true })
      .fill("hello world");
    await page.getByRole("button", { name: "apply", exact: true }).click();
    const saved = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/results") && r.request().method() === "POST",
    );
    await page
      .getByRole("textbox", { name: "Type the words here" })
      .pressSequentially("hello world", { delay: 150 });
    expect((await saved).status()).toBe(200);
    const response = await page.request.get("/api/results");
    const data = await response.json();
    expect(data.results).toHaveLength(1);
    expect(data.results[0].accuracy).toBe(100);
    await page.getByRole("link", { name: "Account", exact: true }).click();
    await page.getByRole("button", { name: "sign out", exact: true }).click();
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Login email" }).fill(email);
    await page.getByRole("textbox", { name: "Login password" }).fill(password);
    await page.getByRole("button", { name: "sign in", exact: true }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    const setting = await page.request.put("/api/settings", {
      data: { theme: "nord" },
    });
    expect(setting.status()).toBe(200);
    await page.reload();
    await expect(
      page.getByRole("button", { name: "nord", exact: true }),
    ).toBeVisible();
    const unauthorized = await page.request.post("/api/results", {
      headers: { Origin: "https://example.org" },
      data: {},
    });
    expect(unauthorized.status()).toBe(403);
  } finally {
    if (created) {
      const cleanup = await page.request.delete("/api/account", {
        data: { password },
      });
      expect(cleanup.status()).toBe(200);
      const me = await page.request.get("/api/auth/me");
      expect((await me.json()).user).toBeNull();
    }
  }
});
