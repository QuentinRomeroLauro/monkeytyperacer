import { test, expect } from "@playwright/test";
test("friend race: invite, ready, shared quote, corrections, standings and rematch", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(90000);
  const a = await browser.newContext({ baseURL }),
    b = await browser.newContext({ baseURL });
  const host = await a.newPage(),
    friend = await b.newPage();
  try {
    await host.goto("/");
    await host.evaluate(() => localStorage.setItem("mtr.racer-name", JSON.stringify("Guest 1793")));
    await host.reload();
    await host
      .getByRole("button", { name: "race a friend", exact: true })
      .last()
      .click();
    await expect(host).toHaveURL(/\/race\//);
    await expect(
      host.getByRole("region", { name: "Race lobby" }),
    ).toBeVisible();
    const ownName = await host.locator(".race-lobby-players>div>span").first().innerText();
    expect(ownName).toContain("(You)");
    expect(ownName).not.toContain("Guest");
    await host.reload();
    await expect(host.locator(".race-lobby-players>div>span").first()).toHaveText(ownName);
    await friend.goto(host.url());
    await friend
      .getByLabel("your racer name", { exact: true })
      .fill("Friend Racer");
    await friend.getByLabel("your racer name", { exact: true }).press("Enter");
    await expect(
      friend.getByRole("region", { name: "Race lobby" }),
    ).toBeVisible();
    await host.getByRole("button", { name: "i’m ready", exact: true }).click();
    await friend
      .getByRole("button", { name: "i’m ready", exact: true })
      .click();
    await expect(
      host.getByRole("button", { name: "start race", exact: true }),
    ).toBeEnabled({ timeout: 10000 });
    await host.getByRole("button", { name: "start race", exact: true }).click();
    const input = host.getByRole("textbox", { name: "Type the race quote" }),
      other = friend.getByRole("textbox", { name: "Type the race quote" });
    await expect(input).toBeEnabled({ timeout: 15000 });
    await expect(other).toBeEnabled({ timeout: 15000 });
    const quote = (await host.locator(".word").allTextContents())
      .map((w) => w.replaceAll("\u200b", ""))
      .join(" ");
    expect(
      (await friend.locator(".word").allTextContents())
        .map((w) => w.replaceAll("\u200b", ""))
        .join(" "),
    ).toBe(quote);
    await input.pressSequentially("~");
    await expect(host.locator(".race-typing-hint")).toContainText("backspace");
    await input.pressSequentially("xxxx ");
    expect((await input.inputValue()).length).toBeLessThanOrEqual(quote.indexOf(" "));
    await input.fill("");
    await input.pressSequentially(quote.slice(0, 3), { delay: 45 });
    await a.setOffline(true);
    await input.pressSequentially(quote.slice(3, 8), { delay: 45 });
    await a.setOffline(false);
    await Promise.all([
      input.pressSequentially(quote.slice(8), { delay: 45 }),
      other.pressSequentially(quote, { delay: 55 }),
    ]);
    await expect(host.getByLabel("Race results")).toBeVisible({
      timeout: 12000,
    });
    await expect(friend.getByLabel("Race results")).toBeVisible({
      timeout: 12000,
    });
    const quoteArea = host.locator(".race-quote-stage");
    await expect(quoteArea.locator(".word")).toHaveCount(quote.split(" ").length);
    const nextRace = host.getByRole("button", { name: "Next race", exact: true });
    await expect(nextRace.locator("kbd")).toHaveCount(2);
    const quoteBox = await quoteArea.boundingBox();
    const nextBox = await nextRace.boundingBox();
    const statsBox = await host.locator(".race-finish-heading").boundingBox();
    expect(quoteBox!.y + quoteBox!.height).toBeLessThan(nextBox!.y);
    expect(nextBox!.y + nextBox!.height).toBeLessThan(statsBox!.y);
    const replay = host.getByRole("slider", { name: "Replay position" });
    await replay.focus();
    await replay.press("Home");
    await expect(quoteArea.locator(".correct")).toHaveCount(0);
    await host.getByRole("button", { name: "replay", exact: true }).click();
    await expect(host.getByRole("button", { name: "pause replay", exact: true })).toBeVisible();
    await expect.poll(() => quoteArea.locator(".correct").count()).toBeGreaterThan(0);
    await host.getByRole("button", { name: "pause replay", exact: true }).click();
    await replay.focus();
    await replay.press("End");
    await expect(host.locator(".race-standings tbody tr")).toHaveCount(2);
    await expect(
      host.getByRole("button", { name: "rematch", exact: true }),
    ).toBeEnabled({ timeout: 10000 });
    await expect(host.locator(".race-finish-title h1")).toContainText(/you finished [12](st|nd)!/);
    await expect(host.locator(".race-finish-stats")).toContainText("accuracy");
    await host.screenshot({path:"/tmp/race-finish-desktop.png",fullPage:true});
    await host.setViewportSize({width:390,height:844});
    await host.screenshot({path:"/tmp/race-finish-mobile.png",fullPage:true});
    await host.setViewportSize({width:1280,height:800});
    await host.reload();
    await expect(host.getByLabel("Race results")).toBeVisible();
    await expect(host.getByRole("slider", { name: "Replay position" })).toBeVisible();
    await host.getByRole("button", { name: "rematch", exact: true }).click();
    await expect(
      friend.getByRole("region", { name: "Race lobby" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(host.getByText("/ round 2", { exact: false })).toBeVisible();
    await host.getByRole("button", { name: "leave", exact: true }).click();
    await friend.getByRole("button", { name: "leave", exact: true }).click();
  } finally {
    await a.close();
    await b.close();
  }
});
test("public matchmaking pairs real guests and solo practice defaults to quotes", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(45000);
  const a = await browser.newContext({ baseURL }),
    b = await browser.newContext({ baseURL });
  const p = await a.newPage(),
    q = await b.newPage();
  try {
    await p.goto("/");
    await q.goto("/");
    await p.evaluate(() => localStorage.setItem("mtr.racer-name", "Public One"));
    await p.reload();
    await q.evaluate(() => localStorage.setItem("mtr.racer-name", "Public Two"));
    await q.reload();
    await Promise.all([
      p.getByRole("button", { name: "Enter a race", exact: true }).last().click(),
      q.getByRole("button", { name: "Enter a race", exact: true }).last().click(),
    ]);
    await expect(p).toHaveURL(/\/race\//);
    await expect(q).toHaveURL(/\/race\//);
    expect(p.url()).toBe(q.url());
    await expect(p.getByLabel("Race progress")).toBeVisible({ timeout: 10000 });
    await p.getByRole("button", { name: "leave", exact: true }).click();
    await q.getByRole("button", { name: "leave", exact: true }).click();
    await p.getByRole("link", { name: "practice", exact: true }).click();
    await expect(
      p.getByRole("button", { name: "quote", exact: true }),
    ).toHaveClass(/selected/);
  } finally {
    await a.close();
    await b.close();
  }
});

test("room capacity and host permissions hold under concurrent joins",async({browser,baseURL})=>{
 test.setTimeout(45000);
 const contexts=await Promise.all(Array.from({length:6},()=>browser.newContext({baseURL})));
 try{
  const created=await contexts[0].request.post("/api/race",{data:{action:"create",name:"Capacity Host"}});
  expect(created.ok()).toBeTruthy();const room=await created.json();
  const joins=await Promise.all(contexts.slice(1).map((context,i)=>context.request.post("/api/race",{data:{action:"join",room:room.id,name:`Guest ${i}`}})));
  expect(joins.filter(r=>r.ok())).toHaveLength(4);expect(joins.filter(r=>r.status()===409)).toHaveLength(1);
  const guestIndex=joins.findIndex(r=>r.ok())+1;
  const forbidden=await contexts[guestIndex].request.post("/api/race",{data:{action:"start",room:room.id}});
  expect(forbidden.status()).toBe(403);
  const view=await (await contexts[0].request.post("/api/race",{data:{action:"view",room:room.id}})).json();
  expect(view.players).toHaveLength(5);expect(view.quote).toBe("");expect(view.players.every((p:Record<string,unknown>)=>!("session" in p)&&!("typed" in p))).toBe(true);
  await Promise.all(contexts.map(context=>context.request.post("/api/race",{data:{action:"leave",room:room.id}})));
 }finally{await Promise.all(contexts.map(c=>c.close()));}
});
