"use client";
import { useState } from "react";
import Link from "next/link";
import { comparisonPairs, comparisonTools } from "@/lib/comparison-pairs";
import { ArrowRight } from "./icons";
export function ComparisonPicker() {
  const [first, setFirst] = useState("monkeytype");
  const [second, setSecond] = useState("typeracer");
  const optionsFor = (id: string) =>
    comparisonTools.filter(
      (tool) =>
        tool.id !== id &&
        comparisonPairs.some(
          (pair) => pair.tools.includes(id) && pair.tools.includes(tool.id),
        ),
    );
  const pair = comparisonPairs.find(
    (pair) => pair.tools.includes(first) && pair.tools.includes(second),
  );
  return (
    <section className="comparison-picker" aria-labelledby="picker-title">
      <div>
        <p className="editorial-eyebrow">side by side</p>
        <h2 id="picker-title">Choose two typing tools.</h2>
        <p>Pick a pair to read its full comparison.</p>
      </div>
      <div className="comparison-picker-controls">
        <label>
          First tool
          <select
            value={first}
            onChange={(event) => {
              const next = event.target.value;
              setFirst(next);
              if (!optionsFor(next).some((tool) => tool.id === second))
                setSecond(optionsFor(next)[0].id);
            }}
          >
            {comparisonTools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </select>
        </label>
        <span className="comparison-picker-vs" aria-hidden="true">
          vs
        </span>
        <label>
          Second tool
          <select
            value={second}
            onChange={(event) => setSecond(event.target.value)}
          >
            {optionsFor(first).map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </select>
        </label>
        {pair && (
          <Link className="editorial-cta" href={`/compare/${pair.slug}`}>
            Read comparison <ArrowRight size={16} />
          </Link>
        )}
      </div>
      <p className="comparison-picker-note">
        The second list shows published comparisons for your first choice.
      </p>
    </section>
  );
}
