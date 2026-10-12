import { Chart } from "./chart";
import type { WarmupResult } from "@/lib/warmup";
export function WarmupResults({result, label = "Quote results"}:{result:WarmupResult; label?: string}) {
  return <section className="warmup-results" aria-label={label} aria-live="polite">
    <div className="warmup-results-body">
    <div className="warmup-stats">
      <div><span>wpm</span><strong data-stat="wpm">{Math.round(result.wpm)}</strong></div>
      <div><span>accuracy</span><strong data-stat="accuracy">{Math.round(result.accuracy)}<small>%</small></strong></div>
      <div><span>time</span><strong data-stat="duration">{result.duration.toFixed(1)}<small>s</small></strong></div>
    </div>
    <Chart samples={result.samples} expanded/>
    </div>
  </section>;
}
