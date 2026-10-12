import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "./icons";
import { guides } from "@/lib/guides";
export function ProductFigure({
  image,
  alt,
  caption,
  priority = false,
}: {
  image: string;
  alt: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <figure className="product-figure">
      <div className="product-window">
        <div className="product-window-bar">
          <span />
          <span />
          <span />
          <small>monkeytyperacer.com</small>
        </div>
        <Image
          src={`/guides/${image}.jpg`}
          alt={alt}
          width={1024}
          height={640}
          priority={priority}
          sizes="(max-width: 700px) 100vw, 1024px"
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
export function GuideCards({ except }: { except?: string }) {
  return (
    <div className="guide-grid">
      {guides
        .filter((g) => g.slug !== except)
        .map((g) => (
          <Link className="guide-card" key={g.slug} href={`/guides/${g.slug}`}>
            <span className="editorial-eyebrow">
              {g.category} <span>{g.minutes} min</span>
            </span>
            <h3>{g.title}</h3>
            <p>{g.description}</p>
            <span className="guide-read">
              read the guide <ArrowRight size={16} />
            </span>
          </Link>
        ))}
    </div>
  );
}
export function ActivityLinks() {
  return (
    <nav className="activity-links" aria-label="Typing activities">
      <Link href="/typing-race-with-friends">
        race with friends <ArrowRight size={15} />
      </Link>
      <Link href="/1-minute-typing-test">
        one-minute test <ArrowRight size={15} />
      </Link>
      <Link href="/quote-typing-practice">
        quote practice <ArrowRight size={15} />
      </Link>
    </nav>
  );
}
