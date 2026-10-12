# Search launch

The site exports `/sitemap.xml`, `/robots.txt`, page-specific canonical metadata, and a social preview at `/social-card`. Only stable public pages appear in the sitemap. Temporary race rooms, login, account, and settings pages carry `noindex, follow`; they remain crawlable so search engines can see that directive.

## Verify the site

1. Sign in to Google Search Console with the account that will own the site. Add the `monkeytyperacer.com` domain property and place Google's exact TXT record in the domain's DNS, or use a URL-prefix property for `https://monkeytyperacer.com` and its HTML meta tag.
2. For HTML verification, set `GOOGLE_SITE_VERIFICATION` to the provided token in Vercel and redeploy. No token is needed for DNS verification.
3. Add the site in Bing Webmaster Tools. Import the verified Search Console property or use Bing's supplied meta token in `BING_SITE_VERIFICATION`, then redeploy.
4. After deploying these changes, submit `https://monkeytyperacer.com/sitemap.xml` to both properties. Inspect the homepage and each landing page to confirm the deployed canonical and crawlability.

Verification tokens are optional and injected server-side. Do not invent tokens or commit Vercel credentials. Verification and sitemap submission require access to the owner's search accounts and, for DNS verification, the domain registrar.

## Public entry points

- `/typing-race-with-friends`: creates a new private room on explicit button click.
- `/1-minute-typing-test`: sets time mode to 60 seconds, then opens practice.
- `/quote-typing-practice`: selects quote mode, then opens practice.
- `/guides`: links to all three guides and all three entry points.

The homepage's race entry interaction is preserved. The footer adds a guides link. No analytics or advertising trackers were introduced.

## Screenshots and sharing

Guide images under `public/guides` are captures of the running product. The results image is an illustrative locally completed custom-text test, not a leaderboard claim. Recapture the images when the related UI changes.

Finished racers can open the sharing dialog, download a 1200×630 PNG, copy result text, or invoke native sharing when available. Sharing never auto-posts. The result text links to the permanent friend-race landing page. The separate challenge button creates a fresh private room; users copy its invite link in the lobby. No private room identifier or racer name is embedded in the exported card.

## Ownership setup — October 11, 2026

- Google Search Console domain property `sc-domain:monkeytyperacer.com` verified through Vercel DNS (TXT record ID `rec_24db80137aeb43307bbf2ea5`). Keep this record in place.
- Bing Webmaster Tools site `https://monkeytyperacer.com` verified through Vercel DNS (CNAME record ID `rec_621d184ae8b32d56e99aef95`). Keep this record in place.
- Submitted `https://monkeytyperacer.com/sitemap.xml` to both services. Bing initially reports Processing. Google accepted submission but initially reports Couldn't fetch; a live URL test and one resubmission were initiated.
- Independently confirmed the live sitemap is valid XML containing 14 URLs, returns HTTP 200, and is advertised in robots.txt. Homepage, guide index, and all three landing pages return HTTP 200 with the expected canonical URLs and no noindex directive.
