import { WpmCalculator } from "@/components/wpm-calculator";
import { AccuracyDrills } from "@/components/accuracy-drills";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { GuideCards, ProductFigure } from "@/components/editorial";
import { StartActivity } from "@/components/start-activity";
export const dynamicParams = false;
export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}
async function getGuide(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();
  return guide;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const g = await getGuide(params);
  return pageMetadata(g.searchTitle, g.description, `/guides/${g.slug}`);
}
export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const g = await getGuide(params);
  return (
    <article className="editorial">
      <header className="editorial-hero">
        <Link className="editorial-back" href="/guides">
          ← all guides
        </Link>
        <p className="editorial-eyebrow">
          {g.category} / {g.minutes} min read
        </p>
        <h1>{g.title}</h1>
        <p className="editorial-deck">{g.description}</p>
      </header>
      <ProductFigure
        image={g.image}
        alt={g.imageAlt}
        caption={g.caption}
        priority
      />
      <div className="article-layout">
        <aside>
          <nav aria-label="In this guide">
            <p className="editorial-eyebrow">in this guide</p>
            {g.sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`}>
                <span>0{i + 1}</span>
                {s.title.replace(/^0\d \/ /, "")}
              </a>
            ))}
          </nav>
        </aside>
        <div className="article-copy">
          {g.sections.map((s) => (
            <section id={s.id} key={s.id}>
              <h2>{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {g.slug === "how-is-typing-wpm-calculated" && s.id === "the-formula" && <WpmCalculator />}
              {g.slug === "improve-typing-accuracy" && s.id === "drills" && <><ProductFigure image="missed-words" height={799} alt="Practice results with the practice missed words button below the result controls" caption="An illustrative capitals exercise: choose “practice missed words” to focus the next run on mistakes." /><AccuracyDrills /></>}
              {"callout" in s && s.callout && (
                <div className="article-callout">{s.callout}</div>
              )}
            </section>
          ))}
          <div className="article-next">
            <p className="editorial-eyebrow">your next run starts here</p>
            <StartActivity mode={g.mode}>{g.cta}</StartActivity>
          </div>
        </div>
      </div>
      <section className="editorial-bottom">
        <h2>Keep the momentum.</h2>
        <GuideCards except={g.slug} />
      </section>
    </article>
  );
}
