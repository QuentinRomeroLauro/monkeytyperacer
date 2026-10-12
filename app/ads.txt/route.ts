import { adsensePublisherId } from "../../lib/adsense";

export const dynamic = "force-static";

export function GET() {
  const publisher = adsensePublisherId();
  return new Response(
    publisher
      ? `google.com, ${publisher.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`
      : "# No advertising sellers are currently authorized.\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
