import { test, expect } from "@playwright/test";

async function seed(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "mtr.results",
      JSON.stringify(
        [30, 80, 40, 90, 60].map((wpm, i) => ({
          id: `chart-${i}`,
          createdAt: new Date(2026, 0, i + 1).toISOString(),
          mode: "time",
          mode2: 30,
          language: "english",
          wpm,
          raw: wpm + 15,
          accuracy: 98,
          consistency: 90,
          duration: 30,
          correct: 100,
          incorrect: 2,
          extra: 0,
          missed: 0,
          punctuation: false,
          numbers: false,
          failed: false,
          difficulty: "normal",
          words: [],
          typed: [],
          samples: [],
        })),
      ),
    );
  });
  await page.goto("/account");
  await expect(page.locator(".chart svg")).toBeVisible();
}

test("curved graph has continuous hover coverage, animated markers, and keyboard inspection", async ({
  page,
}) => {
  await seed(page);
  await expect(page.locator(".wpm-line")).toHaveAttribute("d", / C/);
  const chart = page.locator(".chart svg");
  const coordinates = await chart.evaluate((svg) => {
    const matrix = (svg as SVGSVGElement).getScreenCTM()!;
    return [35, 125, 216, 308, 400, 490, 581, 672, 765].map((x) => {
      const point = new DOMPoint(x, 70).matrixTransform(matrix);
      return { x: point.x, y: point.y };
    });
  });
  for (const [i, point] of coordinates.entries()) {
    await page.mouse.move(point.x, point.y);
    await expect(page.locator(".chart-tooltip")).toHaveClass(/visible/);
    const index = Math.floor(i / 2);
    await expect(page.locator(".chart-tooltip")).toContainText(`${index + 1}s`);
  }
  await expect(page.locator(".chart-marker").first()).toHaveCSS(
    "transition-property",
    "transform",
  );
  await chart.focus();
  await page.keyboard.press("Home");
  await expect(page.locator(".chart-tooltip")).toContainText("1s");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".chart-tooltip")).toContainText("2s");
  await page.mouse.move(0, 0);
  await expect(page.locator(".chart-tooltip")).not.toHaveClass(/visible/);
});

test("hover works at mobile size and honors reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page);
  const chart = page.locator(".chart svg");
  await chart.focus();
  for (const key of ["Home", "End"]) {
    await page.keyboard.press(key);
    const bounds = await page.locator(".chart-tooltip").boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  }
  await expect(page.locator(".chart-marker").first()).toHaveCSS(
    "transition-property",
    "none",
  );
});
