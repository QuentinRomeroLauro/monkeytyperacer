import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Typing races with friends | Monkeytype Racer", "Race quotes with real people. Create a private typing race, invite friends, or practice solo. Guests welcome.", "/");
import { RaceHome } from "@/components/race-home";
export default function Home() {
  return <RaceHome />;
}
