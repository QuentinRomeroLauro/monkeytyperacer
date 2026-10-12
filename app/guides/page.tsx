import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { ActivityLinks, GuideCards } from "@/components/editorial";
export const metadata = pageMetadata(
  "Typing guides",
  "Understand your WPM, improve typing accuracy, and host a typing race with friends. Practical guides for your next run.",
  "/guides",
);
export default function GuidesPage() {
  return (
    <div className="editorial">
      <header className="editorial-hero">
        <p className="editorial-eyebrow">the field notes / typing guides</p>
        <h1>
          A little practice.
          <br />
          <em>A better next race.</em>
        </h1>
        <p className="editorial-deck">
          Understand your score, find your rhythm, and bring a friend along. A
          few useful reads before your next run.
        </p>
      </header>
      <GuideCards />
      <section className="editorial-bottom">
        <h2>Choosing a typing tool?</h2>
        <p className="editorial-deck">
          Compare solo practice, quote racing and games to play with friends.
        </p>
        <Link className="editorial-cta" href="/compare">
          Explore the comparisons →
        </Link>
      </section>
      <section className="editorial-bottom">
        <p className="editorial-eyebrow">put it into practice</p>
        <ActivityLinks />
      </section>
    </div>
  );
}
