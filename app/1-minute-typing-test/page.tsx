import { pageMetadata } from "@/lib/seo";
import { ActivityPage } from "@/components/activity-page";
export const metadata = pageMetadata(
  "1-minute typing test",
  "Test your typing speed in 60 seconds. See WPM, accuracy, and a speed chart with a free one-minute typing test.",
  "/1-minute-typing-test",
);
export default function Page() {
  return <ActivityPage mode="minute" />;
}
