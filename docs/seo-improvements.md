# SEO page improvements — October 12, 2026

Implemented the five-pass recommendations on existing URLs:

- `/quote-typing-practice` and `/1-minute-typing-test` now render the shared practice engine directly, retaining their canonical metadata and supporting text. The first keystroke starts practice; it never joins a race. Existing `practice_started` and `practice_completed` analytics include the landing-page path.
- Accuracy guide includes original capitals, apostrophe and repeated-letter exercises. Stable `/practice?drill=…` links initialize a custom exercise without changing theme or unrelated preferences. Invalid drill IDs fall back to ordinary quote practice. `accuracy_drill_opened` records only a fixed drill identifier, never typed text.
- Results offer “practice missed words” when attempted words contain mistakes. Unattempted tail words are excluded. The action switches to a finite custom exercise. `public/guides/missed-words.jpg` is an illustrative real local run, captured with an intentional error in the capitals exercise, not a leaderboard or user performance claim.
- WPM guide has a basic eligible-characters/time calculator and clarification of raw speed, accuracy and site-specific error handling. The calculator does not duplicate engine scoring. `wpm_calculator_used` records use, not entered values.
- Hosting guide explains manually tracked first-to-two wins, a worked example, invitation text and an agreed disconnect policy. With two players this is best-of-three; larger groups may require more rounds. No automatic bracket/series-scoring feature is claimed.

Compare each changed page's Search Console clicks/impressions after sufficient indexed traffic and a meaningful observation window. Compare landing-page starts/completions and drill usage separately from search visibility. Search Console data was still processing at research time, so no performance lift is claimed. No recurring automation is active.
