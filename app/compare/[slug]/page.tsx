import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  comparisons,
  comparisonImages,
  comparisonReviewDate,
} from "@/lib/comparisons";
import { ComparisonCards } from "@/components/comparison-cards";
import { pageMetadata } from "@/lib/seo";
export const dynamicParams = false;
export function generateStaticParams() {
  return comparisons.map((a) => ({ slug: a.slug }));
}
async function getArticle(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const article = comparisons.find((a) => a.slug === slug);
  if (!article) notFound();
  return article;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = await getArticle(params);
  return pageMetadata(a.title, a.description, `/compare/${a.slug}`);
}
export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = await getArticle(params);
  return (
    <article className="editorial comparison-article">
      <header className="editorial-hero">
        <Link className="editorial-back" href="/compare">
          ← all comparisons
        </Link>
        <p className="editorial-eyebrow">
          the shortlist / reviewed{" "}
          <time dateTime={comparisonReviewDate}>October 12, 2026</time>
        </p>
        <h1>{a.title}</h1>
        <p className="editorial-deck">{a.description}</p>
        <p className="comparison-disclosure">
          By the Monkeytype Racer team. We publish one of the products
          discussed. We are independent of Monkeytype, TypeRacer and Nitro Type.
        </p>
      </header>
      <section className="comparison-verdict" aria-labelledby="verdict">
        <p className="editorial-eyebrow" id="verdict">
          the short answer
        </p>
        <p>{a.verdict}</p>
      </section>
      <div
        className="comparison-table"
        role="region"
        aria-label="Product comparison"
        tabIndex={0}
      >
        <table>
          <caption>Choose by the session you want</caption>
          <thead>
            <tr>
              {a.columns.map((c) => (
                <th scope="col" key={c}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th scope="row" key={a.columns[i]}>
                      {cell}
                    </th>
                  ) : (
                    <td key={a.columns[i]}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="comparison-screens">
        {a.images.map((id) => {
          const img = comparisonImages[id];
          return (
            <figure className="product-figure" key={id}>
              <div className="product-window">
                <div className="comparison-screen-label">
                  <a href={img.url}>{img.name} ↗</a>
                  <span>product capture</span>
                </div>
                <Image
                  src={`/comparisons/${id}.jpg`}
                  width={1200}
                  height={id === "typeracer" ? 390 : 675}
                  alt={img.caption}
                  sizes="(max-width: 700px) 100vw, 540px"
                />
              </div>
              <figcaption>{img.caption}</figcaption>
            </figure>
          );
        })}
      </div>
      <div className="article-layout">
        <aside>
          <nav aria-label="In this comparison">
            <p className="editorial-eyebrow">in this comparison</p>
            {a.sections.map((s, i) => (
              <a href={`#section-${i + 1}`} key={s.title}>
                <span>0{i + 1}</span>
                {s.title}
              </a>
            ))}
            <a href="#sources">Sources & review method</a>
          </nav>
        </aside>
        <div className="article-copy">
          {a.sections.map((s, i) => (
            <section id={`section-${i + 1}`} key={s.title}>
              <h2>{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
          <section id="sources">
            <h2>Sources & review method</h2>
            <p>
              We inspected the official product interfaces and selected guest
              flows on October 12, 2026. Screenshots are from that review. We
              did not run controlled speed benchmarks, large multiplayer events
              or long-term learning studies. Features and access requirements
              can change; verify the relevant flow before organizing an event.
            </p>
            <ul>
              {a.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url}>{s.label} ↗</a>
                </li>
              ))}
            </ul>
            <p>
              For our own product, see{" "}
              <Link href="/typing-race-with-friends">
                room setup and limits
              </Link>
              , <Link href="/quote-typing-practice">quote practice</Link> and{" "}
              <Link href="/guides/how-is-typing-wpm-calculated">
                how WPM is calculated
              </Link>
              .
            </p>
          </section>
          <div className="article-next">
            <p className="editorial-eyebrow">try a session</p>
            <Link className="editorial-cta" href={a.cta}>
              {a.ctaLabel} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      <section className="editorial-bottom">
        <h2>Keep comparing.</h2>
        <ComparisonCards except={a.slug} />
      </section>
    </article>
  );
}
