import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Typing races with friends | Monkeytype Racer", "Race quotes with real people. Create a private typing race, invite friends, or practice solo. Guests welcome.", "/");
import { RaceHome } from "@/components/race-home";
import { connection } from "next/server";
import { generateWords } from "@/lib/engine";
import english from "@/public/languages/english.json";
import quotes from "@/lib/race-quotes.json";
export default async function Home() {
  await connection();
  const indices = new Set<number>();
  while (indices.size < Math.min(12, quotes.length)) {
    indices.add(Math.floor(Math.random() * quotes.length));
  }
  const warmups = [...indices].map(index => {
    const quote = quotes[index];
    const [source, author] = quote.source.split(" — ");
    return { text: quote.text, source, author };
  });
  const wordWarmups = warmups.map(() => generateWords(english.words, 25, { punctuation: false, numbers: false }).join(" "));
  return <RaceHome warmups={warmups} wordWarmups={wordWarmups} />;
}
