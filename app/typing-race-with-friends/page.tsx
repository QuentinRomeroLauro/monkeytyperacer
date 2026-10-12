import { pageMetadata } from "@/lib/seo";
import { ActivityPage } from "@/components/activity-page";
export const metadata = pageMetadata(
  "Typing race with friends",
  "Create a private typing race for up to five friends. Share a link, ready up, and race the same quote. Free to play, no account needed.",
  "/typing-race-with-friends",
);
export default function Page() {
  return <ActivityPage mode="friends" />;
}
