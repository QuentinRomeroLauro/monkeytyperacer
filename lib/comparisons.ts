import articles from "./comparisons.json";
export const comparisons = articles;
export const comparisonReviewDate = "2026-10-12";
export const comparisonImages: Record<
  string,
  { name: string; url: string; caption: string }
> = {
  keybr: {
    name: "Keybr",
    url: "https://www.keybr.com/",
    caption:
      "Keybr’s current-key status, lesson text and on-screen keyboard in a fresh practice session.",
  },
  typerio: {
    name: "Typer.io",
    url: "https://typer.io/",
    caption:
      "Typer.io’s home screen separates Quick Play, Solo Play and Group Play.",
  },
  mtr: {
    name: "Monkeytype Racer",
    url: "https://monkeytyperacer.com/practice",
    caption:
      "Our separate solo practice page defaults to quotes, with a link back to racing.",
  },
  monkeytype: {
    name: "Monkeytype",
    url: "https://monkeytype.com/",
    caption:
      "Monkeytype’s quote mode and length controls, captured during the review.",
  },
  typeracer: {
    name: "TypeRacer",
    url: "https://play.typeracer.com/",
    caption:
      "TypeRacer’s public-race entry and guest account message, cropped from its home screen.",
  },
  nitrotype: {
    name: "Nitro Type",
    url: "https://www.nitrotype.com/",
    caption:
      "Nitro Type’s public homepage presents its racing game and teacher-facing offering.",
  },
};
