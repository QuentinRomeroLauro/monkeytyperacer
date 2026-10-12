import { test, expect } from "@playwright/test";
import { raceView, type RaceState, type Racer } from "../../lib/race";

for (const completed of [true, false]) {
  test(`finish presentation: ${completed ? "completed" : "timed out"}`, async ({ page }) => {
    const now = Date.now();
    const player: Racer = {id:"me",session:"test",name:"Test Racer",ready:true,joinedAt:now-70000,seenAt:now,typed:completed?"hello world":"hello",samples:[],seq:11,attempts:11,errors:0,finishedAt:completed?now:null,left:false};
    const state: RaceState = {id:"finish-fixture",kind:"public",phase:"finished",host:"me",round:1,quote:"hello world",source:"Test quote",createdAt:now-70000,startAt:now-60000,deadline:now,players:[player]};
    await page.route("**/api/race", route => route.fulfill({json:raceView(state,"test",now)}));
    await page.goto("/race/finish-fixture");
    await expect(page.getByLabel("Race results")).toBeVisible();
    await expect(page.locator(".race-finish-title h1")).toHaveText(completed ? "you finished 1st!" : "time’s up");
    await expect(page.locator(".race-finish-title h1")).toBeFocused();
    await expect(page.getByRole("button",{name:"race again",exact:true})).toBeEnabled();
    if (!completed) {
      await expect(page.locator(".race-finish-stats")).toContainText("completed");
      await expect(page.locator(".race-standings")).toContainText("unfinished");
    }
  });
}
