import { test, expect } from "@playwright/test";
import { defaults } from "../../lib/config";

async function expectAligned(page: import("@playwright/test").Page) {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const input =
          document.querySelector<HTMLTextAreaElement>(".typing-input")!;
        const word = document.querySelector<HTMLElement>(".active-word")!;
        const target =
          word.children[
            Math.min(input.value.length, word.children.length - 1)
          ].getBoundingClientRect();
        const caret = document.querySelector(".caret")!.getBoundingClientRect();
        return (
          Math.abs(caret.left - target.left) < 1 &&
          Math.abs(caret.top - word.getBoundingClientRect().top) < 1
        );
      }),
    )
    .toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (config) => localStorage.setItem("mtr.config", JSON.stringify(config)),
    {
      ...defaults,
      mode: "custom",
      customText: `${"hello world smooth typing ".repeat(20)}finish`,
    },
  );
});

test("caret interpolates, retargets fast input, and ignores timer ticks", async ({
  page,
}) => {
  await page.goto("/practice");
  const input = page.getByRole("textbox", { name: "Type the words here" });
  await expect(input).toBeFocused();
  await expectAligned(page);
  const start = (await page.locator(".caret").boundingBox())!.x;
  await input.press("h");
  const frames = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const positions: number[] = [];
        const start = performance.now();
        function frame() {
          positions.push(
            document.querySelector(".caret")!.getBoundingClientRect().left,
          );
          if (performance.now() - start < 150) requestAnimationFrame(frame);
          else resolve(positions);
        }
        requestAnimationFrame(frame);
      }),
  );
  const end = frames.at(-1)!;
  expect(end).toBeGreaterThan(start + 10);
  expect(frames.some((x) => x > start + 1 && x < end - 1)).toBe(true);
  expect(frames.every((x, i) => i === 0 || x >= frames[i - 1] - 0.1)).toBe(
    true,
  );
  await input.pressSequentially("ello wor", { delay: 8 });
  await expectAligned(page);
  const changes = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let count = 0;
        const observer = new MutationObserver((records) => {
          count += records.length;
        });
        observer.observe(document.querySelector(".caret")!, {
          attributes: true,
          attributeFilter: ["style"],
        });
        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, 350);
      }),
  );
  expect(changes).toBe(0);
  await input.press("Backspace");
  await expectAligned(page);
});

test("caret stays aligned after line wrapping, scrolling, resize and font changes", async ({
  page,
}) => {
  await page.goto("/practice");
  const input = page.getByRole("textbox", { name: "Type the words here" });
  await expect(input).toBeFocused();
  await input.pressSequentially("hello world smooth typing ".repeat(8), {
    delay: 3,
  });
  await expectAligned(page);
  await page.evaluate(async () => {
    await document.fonts.load('32px "JetBrains Mono"');
    document.documentElement.style.setProperty(
      "--typing-font",
      '"JetBrains Mono", monospace',
    );
  });
  await expectAligned(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectAligned(page);
  await expect.poll(() => page.evaluate(() => {
    const caret = document.querySelector(".caret")!.getBoundingClientRect();
    const viewport = document
      .querySelector(".words-viewport")!
      .getBoundingClientRect();
    return caret.top >= viewport.top && caret.bottom <= viewport.bottom;
  })).toBe(true);
});

test("reduced motion and disabled smoothing move without animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/practice");
  const input = page.getByRole("textbox", { name: "Type the words here" });
  await expect(input).toBeFocused();
  await input.press("h");
  await expectAligned(page);
  expect(
    await page.locator(".caret").evaluate((e) => e.getAnimations().length),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    const config = JSON.parse(localStorage.getItem("mtr.config")!);
    localStorage.setItem(
      "mtr.config",
      JSON.stringify({ ...config, smoothCaret: false }),
    );
    window.dispatchEvent(new StorageEvent("storage", { key: "mtr.config" }));
  });
  await expect(page.locator(".caret")).not.toHaveClass(/smooth/);
  await input.press("e");
  await expectAligned(page);
  expect(
    await page.locator(".caret").evaluate((e) => e.getAnimations().length),
  ).toBe(0);
});
