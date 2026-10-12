import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Typing practice", "Practice quotes, timed typing tests, word lists, and custom text. See your WPM, accuracy, and progress after every test.", "/practice");
import { isPracticeDrill, practiceDrills } from "@/lib/practice-drills";
import Link from "next/link";
import { PracticeSession } from "@/components/practice-session";
export default async function PracticePage({ searchParams }: { searchParams: Promise<{ mode?: string; drill?: string }> }) {
  const { mode, drill: requestedDrill } = await searchParams;
  const drill = isPracticeDrill(requestedDrill) ? requestedDrill : undefined;
  return (
    <>
      <div className="practice-navigation">
        <Link href="/">← back to races</Link>
        <span>{drill ? `${practiceDrills[drill].title.toLowerCase()} / accuracy practice` : "solo practice"}</span>
      </div>
      <PracticeSession key={drill ?? mode ?? "quote"} minute={mode === "minute"} drill={drill} />
    </>
  );
}
