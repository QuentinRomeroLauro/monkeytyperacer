import Link from "next/link";
import { practiceDrills } from "@/lib/practice-drills";
export function AccuracyDrills() {
  return <div className="accuracy-drills">
    {Object.entries(practiceDrills).map(([id, drill]) => <div className="guide-tool drill-card" key={id}>
      <h3>{drill.title}</h3><p>{drill.description}</p>
      <blockquote>{drill.text}</blockquote>
      <Link className="drill-link" href={`/practice?drill=${id}`}>practice {drill.title.toLowerCase()} →</Link>
    </div>)}
    <p className="tool-note">Each link opens a short custom-text exercise. Your theme and other typing preferences stay yours. After a run, use “practice missed words” to revisit mistakes, or choose “repeat test” to retry the full exercise.</p>
  </div>;
}
