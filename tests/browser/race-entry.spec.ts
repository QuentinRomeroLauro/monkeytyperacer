import {test,expect} from "@playwright/test";
import quotes from "../../lib/race-quotes.json";

test("homepage quote supports typing and correction without joining; button enters explicitly",async({page})=>{
 const calls: Record<string,unknown>[]=[];
 await page.route("**/api/race",async route=>{
  calls.push(route.request().postDataJSON());
  await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:"Test connection unavailable"})});
 });
 await page.goto("/");
 const input=page.getByRole("textbox",{name:"Type the quote",exact:true});
 await expect(input).toBeFocused();
 await expect(page.getByRole("region",{name:"Quote attribution"})).toHaveCount(0);
 const quote=(await page.locator(".word").allTextContents()).map(w=>w.replaceAll("\u200b","")).join(" ");
 await input.pressSequentially("~~~");
 await expect(page.locator(".race-typing-hint")).toContainText("backspace");
 await input.press("Backspace");
 await input.press("Backspace");
 await input.press("Backspace");
 await input.pressSequentially(quote,{delay:1});
 await expect(page.getByRole("region",{name:"Quote results"})).toBeVisible();
 await expect(page.locator("[data-stat=accuracy]")).not.toHaveText("100%");
 const attribution=page.getByRole("region",{name:"Quote attribution"});
 const expected = quotes.find(q => q.text === quote)!;
 expect(expected).toBeDefined();
 await expect(attribution).toContainText(expected.source.split(" — ")[0]);
 await expect(attribution).toContainText(`by ${expected.source.split(" — ")[1]}`);
 const attributionBox=await attribution.boundingBox();
 const resultsBox=await page.getByRole("region",{name:"Quote results"}).boundingBox();
 expect(attributionBox!.y+attributionBox!.height).toBeLessThanOrEqual(resultsBox!.y);
 expect(attributionBox!.x).toBeCloseTo(resultsBox!.x,0);
 await expect(attribution).toHaveCSS("text-align","left");
 expect(calls).toHaveLength(0);
 await page.getByRole("button",{name:"Enter a race",exact:true}).click();
 await expect(page.locator(".race-launch-status [role=alert]")).toHaveText("Test connection unavailable");
 expect(calls).toHaveLength(1);expect(calls[0].action).toBe("queue");
 await page.getByRole("button",{name:"another quote",exact:true}).click();
 await expect(input).toBeEnabled();
 expect((await page.locator(".word").allTextContents()).join(" ")).not.toBe(quote);
 await expect(attribution).toHaveCount(0);
 const nextQuote=(await page.locator(".word").allTextContents()).map(w=>w.replaceAll("\u200b","")).join(" ");
 await input.pressSequentially(nextQuote,{delay:1});
 const nextExpected = quotes.find(q => q.text === nextQuote)!;
 expect(nextExpected).toBeDefined();
 await expect(attribution).toContainText(nextExpected.source.split(" — ")[0]);
 await expect(attribution).toContainText(`by ${nextExpected.source.split(" — ")[1]}`);
});

test("mobile can enter directly without completing the quote",async({page})=>{
 let calls=0;
 await page.route("**/api/race",async route=>{
  calls++;await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:"Test connection unavailable"})});
 });
 await page.setViewportSize({width:390,height:844});await page.goto("/");
 await expect(page.getByRole("textbox",{name:"Type the quote",exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Enter a race",exact:true}).click();
 await expect(page.locator(".race-launch-status [role=alert]")).toBeVisible();expect(calls).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("unfocused quote blurs behind a sharp focus prompt and restores on click",async({page})=>{
 await page.goto("/");
 const input=page.getByRole("textbox",{name:"Type the quote",exact:true});
 await expect(input).toBeFocused();
 await input.evaluate(el=>(el as HTMLTextAreaElement).blur());
 const prompt=page.getByRole("button",{name:"click here to focus",exact:true});
 await expect(prompt).toBeVisible();
 await expect(page.locator(".race-type-area .words-container")).toHaveCSS("filter","blur(4px)");
 await expect(prompt).toHaveCSS("filter","none");
 await prompt.click();
 await expect(input).toBeFocused();
 await expect(prompt).toBeHidden();
 await expect(page.locator(".race-type-area .words-container")).toHaveCSS("filter","none");
});

for(const platform of ["MacIntel","Win32"]) {
 test(`${platform} shortcut enters once and respects open dialogs`,async({page})=>{
  await page.addInitScript(platform=>Object.defineProperty(navigator,"platform",{get:()=>platform}),platform);
  let calls=0;
  await page.route("**/api/race",async route=>{
   calls++;await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:"Test connection unavailable"})});
  });
  await page.goto("/");
  const button=page.getByRole("button",{name:"Enter a race",exact:true});
  await expect(button).toHaveAttribute("aria-keyshortcuts",platform==="MacIntel"?"Meta+Enter":"Control+Enter");
  await expect(button.locator("kbd")).toHaveText([platform==="MacIntel"?"⌘":"Ctrl","Enter"]);
  await expect(page.getByRole("textbox",{name:"Type the quote",exact:true})).toBeFocused();
  const shortcut=platform==="MacIntel"?"Meta+Enter":"Control+Enter";
  await page.keyboard.press("Escape");
  await expect(page.getByRole("textbox",{name:"Search command"})).toBeVisible();
  await page.keyboard.press(shortcut);expect(calls).toBe(0);
  await page.keyboard.press("Escape");
  const modifier=platform==="MacIntel"?"Meta":"Control";
  const keys=page.locator(".race-shortcut kbd");
  await page.keyboard.down(modifier);
  await expect(keys.nth(0)).toHaveClass("is-pressed");
  await expect(keys.nth(1)).not.toHaveClass("is-pressed");
  await page.keyboard.down("Enter");
  await expect(keys.nth(1)).toHaveClass("is-pressed");
  await expect(keys.nth(1)).toHaveCSS("transform","matrix(1, 0, 0, 1, 0, 2)");
  await page.keyboard.up("Enter");
  await expect(keys.nth(1)).not.toHaveClass("is-pressed");
  await page.keyboard.up(modifier);
  await expect(keys.nth(0)).not.toHaveClass("is-pressed");
  await expect(page.locator(".race-launch-status [role=alert]")).toBeVisible();expect(calls).toBe(1);
  await page.keyboard.down(modifier);
  await page.evaluate(()=>window.dispatchEvent(new Event("blur")));
  await expect(page.locator(".race-shortcut .is-pressed")).toHaveCount(0);
  await page.keyboard.up(modifier);
 });
}

test("logo resets completed and in-progress homepage warmups and returns from practice", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Type the quote", exact: true });
  const quote = (await page.locator(".word").allTextContents()).map(w => w.replaceAll("\u200b", "")).join(" ");
  await input.pressSequentially(quote, { delay: 1 });
  await expect(page.getByRole("region", { name: "Quote results" })).toBeVisible();
  const logo = page.getByRole("link", { name: "Monkeytype Racer home" });
  await logo.click();
  await expect(input).toBeVisible();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(page.getByRole("region", { name: "Quote results" })).toHaveCount(0);
  await input.pressSequentially("~");
  await logo.click();
  await expect(input).toHaveValue("");
  await page.goto("/practice");
  await logo.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(input).toBeVisible();
  await expect(input).toHaveValue("");
});
