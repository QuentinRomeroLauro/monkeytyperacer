# AdSense setup and monetization experiments

## Current stage

AdSense account created on October 11, 2026 using `quentin@tryinspector.com`,
with United States as the confirmed payment country and terms accepted with the
owner's explicit approval. Publisher: `ca-pub-4964806002936045`.
Ownership verified by Google using the deployed meta tag. Review requested;
AdSense shows **Getting ready** / **Review requested**. The owner completed the
payment profile; the onboarding dashboard confirms **We've got your info**,
**Ads settings confirmed**, and **Nice work, you've completed all the steps**.
Review requested is not approval. Any later payment, tax, or identity verification
requests must still be completed when Google presents them.

Production deployment of commit `effd83a` is live at `https://monkeytyperacer.com`.
Verified HTTP 200 plain-text `/ads.txt` containing:

```text
google.com, pub-4964806002936045, DIRECT, f08c47fec0942fa0
```

AdSense's ads.txt dashboard still showed Not found immediately after deployment;
its crawler status has not yet caught up. The live publisher meta tag matches.
Auto ads and Auto optimize are both confirmed Off in the AdSense site table.

Saved consent drafts (not published or running on the site):
- **Monkeytype Racer — European consent**: English, this site's privacy URL,
  Consent / Do not consent / Manage options; refusal enabled across all listed
  European regions, automatic consent-message optimization Off, text header.
- **Monkeytype Racer — US privacy choices**: English, opt-out link, all current
  and future supported US states.

Publish and verify the consent integration, provider/purpose settings, privacy
policy disclosures, and persistent reopening controls before enabling the first
ad placement. Saving these drafts does not make the site consent-ready.

The application supports verification without loading Google's advertising
JavaScript. `ADSENSE_PUBLISHER_ID` supplies the `google-adsense-account` head
metadata and `/ads.txt` authorized seller entry. It must match Google's exact
`ca-pub-` ID. A missing value omits verification metadata and publishes an ads.txt
comment with no authorized sellers. An invalid value fails rather than publishing
an incorrect seller. Both outputs are built at deployment time; rebuild after
changing the environment variable.

No ad slots, Auto ads, advertising requests, or consent scripts are enabled.
The current privacy statement that advertising trackers are absent remains true.
Quentin will specify the placements separately.

## Finish account and site review

1. Add the account owner's date of birth through Google's account interface.
2. Finish AdSense registration with the correct payee country and account type.
   The owner must approve the displayed AdSense terms before acceptance. Do not
   invent identity, payment, tax, or address information.
3. Add `monkeytyperacer.com` and obtain the exact publisher ID.
4. Set `ADSENSE_PUBLISHER_ID` in Vercel Production. Publish the corresponding
   committed source and deploy following `docs/development.md`.
5. Confirm the live homepage contains the publisher meta tag and `/ads.txt`
   returns Google's exact seller record as plain text. Use AdSense's meta-tag or
   ads.txt verification option, verify, and request site review.
6. Keep Auto ads disabled in AdSense. Review acceptance is independent of search
   engine indexing and does not require injecting ads into the homepage.
7. Record the confirmed publisher ID, site review status, and consent-message
   status here. Do not record private payment or tax information.

## Before the first visible ad experiment

- Configure and publish Google's Privacy & messaging consent messages for the
  applicable regions, including European regulations and applicable US state
  choices. Use explicit consent, do-not-consent, and manage-options controls.
  Implement a persistent way to reopen choices. A product analytics opt-out is
  not advertising consent.
- Update the privacy policy to describe the actual enabled advertising data
  processing, providers, cookies, purposes, regional rights, and controls; link
  Google's information about data use. Do not claim consent is implemented until
  the actual integration has been verified.
- Add the approved manual placements and load Google's script only under the
  chosen consent integration. Keep controls for disabling all ads and individual
  experiments. Do not assume selecting non-personalized ads removes consent
  obligations.
- Reserve space, handle unfilled/blocked ads, and verify that typing focus,
  race timing, navigation, and mobile layout remain stable. Keep ads separate
  from game controls; Google recommends 150px separation from games or no ads on
  gameplay pages.
- Test consent acceptance, refusal, reopening, and script failure with no live
  ad clicking. Do not refresh ads on keystrokes, timers, or race progress.
- Record each experiment's placement, allocation, dates, and success criteria.
  Compare revenue with race completion, return usage, layout shift, and input
  responsiveness. Do not send typed text, account details, private room IDs, or
  consent strings to product analytics.

## Google references

- [Connect and request review](https://support.google.com/adsense/answer/7584263?hl=en)
- [Consent management requirements](https://support.google.com/adsense/answer/13554116)
- [Gameplay placement guidance](https://support.google.com/adsense/answer/2768340?hl=en)
