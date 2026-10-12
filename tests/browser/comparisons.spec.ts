import { test, expect } from "@playwright/test";
import articles from "../../lib/comparisons.json";
for (const article of articles) {
  test(`comparison: ${article.slug}`, async ({ page }) => {
    await page.goto(`/compare/${article.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      article.title,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://monkeytyperacer.com/compare/${article.slug}`,
    );
    await expect(
      page.getByText("We publish one of the products discussed.", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.locator("#sources a").first()).toHaveAttribute(
      "href",
      article.sources[0].url,
    );
    for (const image of await page.locator(".comparison-screens img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole("link", { name: article.ctaLabel, exact: true }),
    ).toHaveAttribute("href", article.cta);
  });
}
test("comparisons are discoverable and unknown slugs return 404", async ({
  page,
  request,
}) => {
  await page.goto("/guides");
  await page.getByRole("link", { name: "Explore the comparisons" }).click();
  for (const article of articles)
    await expect(
      page.locator(`a[href="/compare/${article.slug}"]`),
    ).toBeVisible();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const article of articles)
    expect(sitemap).toContain(`/compare/${article.slug}`);
  expect((await request.get("/compare/does-not-exist")).status()).toBe(404);
});
