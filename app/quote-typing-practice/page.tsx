import { pageMetadata } from "@/lib/seo";
import { ActivityPage } from "@/components/activity-page";
export const metadata = pageMetadata(
  "Quote typing practice",
  "Improve your typing with real quotes, capitals, and punctuation. Choose your quote length and review your speed and accuracy.",
  "/quote-typing-practice",
);
export default function Page() {
  return <ActivityPage mode="quote" />;
}
