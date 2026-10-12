import { ComparisonCards } from "@/components/comparison-cards";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Typing games and tools compared",
  "Find a typing tool for solo practice, quote racing or playing with friends. Dated comparisons with product screenshots and official sources.",
  "/compare",
);
export default function ComparePage() {
  return (
    <div className="editorial">
      <header className="editorial-hero">
        <p className="editorial-eyebrow">the shortlist / typing tools</p>
        <h1>
          Find your kind
          <br />
          <em>of typing session.</em>
        </h1>
        <p className="editorial-deck">
          Solo drills, a friendly race, or a game to return to. Compare the
          choices by what you actually want to do.
        </p>
      </header>
      <ComparisonCards />
    </div>
  );
}
