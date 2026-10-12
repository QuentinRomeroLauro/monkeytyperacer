import articles from "./comparisons.json";
export const comparisons = articles;
export const comparisonReviewDate = "2026-10-12";
export const comparisonImages: Record<
  string,
  { name: string; url: string; caption: string }
> = {
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
