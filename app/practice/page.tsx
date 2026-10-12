import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Typing practice", "Practice quotes, timed typing tests, word lists, and custom text. See your WPM, accuracy, and progress after every test.", "/practice");
import Link from "next/link";
import { PracticeSession } from "@/components/practice-session";
export default async function PracticePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return (
    <>
      <div className="practice-navigation">
        <Link href="/">← back to races</Link>
        <span>solo practice</span>
      </div>
      <PracticeSession key={mode ?? "quote"} minute={mode === "minute"} />
    </>
  );
}
