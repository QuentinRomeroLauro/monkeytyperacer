import Link from "next/link";
import { comparisons } from "@/lib/comparisons";
import { ArrowRight } from "./icons";
export function ComparisonCards({ except }: { except?: string }) {
  return (
    <div className="guide-grid">
      {comparisons
        .filter((a) => a.slug !== except)
        .map((a) => (
          <Link className="guide-card" href={`/compare/${a.slug}`} key={a.slug}>
            <span className="editorial-eyebrow">
              the shortlist / comparisons
            </span>
            <h3>{a.title}</h3>
            <p>{a.description}</p>
            <span className="guide-read">
              compare the options <ArrowRight size={16} />
            </span>
          </Link>
        ))}
    </div>
  );
}
