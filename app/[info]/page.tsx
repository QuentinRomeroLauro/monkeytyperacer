import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
const pages: Record<string, { title: string; paragraphs: string[] }> = {
  privacy: {
    title: "privacy policy",
    paragraphs: [
      "Typing preferences and recent results are stored in your browser. If you create an account, your email address, username, password hash, preferences, and typing results are stored in Neon Postgres. Passwords are hashed; the original password is never stored.",
      "An HTTP-only session cookie keeps you signed in. A separate HTTP-only racer cookie identifies your guest seat for up to 30 days. Racer names, typed quote text, keystroke counts, timing, and race standings are stored in Neon; names and race progress are visible to people with access to the room. Rooms can be rejoined for 24 hours. We do not include advertising or analytics trackers. Vercel processes requests to host the application.",
      "Your username and eligible test scores appear on this project’s leaderboard. You can export your result history from the account page and delete your account and cloud results there. Local browser data can be removed through your browser’s site settings.",
      "This is an independent project, separate from monkeytype.com. External links lead to websites with their own privacy policies.",
    ],
  },
  terms: {
    title: "terms of use",
    paragraphs: [
      "This independent typing application is provided as-is for practice and personal use. It is not affiliated with or endorsed by Monkeytype or TypeRacer.",
      "You are responsible for the content you enter and your account credentials. Do not use the service to abuse other users, attempt unauthorized access, or submit automated scores as genuine typing results.",
      "The application is free software under GPLv3. Separately licensed assets retain their own terms. These service rules do not restrict the rights granted by the software or asset licenses. The source and licenses page provides the full license, corresponding source, copyright notices, and warranty disclaimer.",
      "Leaderboards currently use client-reported results and are intended for practice, not verified competitions.",
    ],
  },
  security: {
    title: "security",
    paragraphs: [
      "Passwords are hashed using bcrypt. Sessions use random tokens, with only token hashes stored in the database, and secure HTTP-only cookies in production. Authenticated writes check their origin and database queries are parameterized.",
      "Registration, login, and result submission are rate limited. Account deletion requires your password and removes related sessions and cloud results.",
      "Use a unique password for this independent project. This release does not offer password recovery or external identity providers.",
    ],
  },
};
export async function generateMetadata({ params }: { params: Promise<{ info: string }> }) {
  const { info } = await params;
  const page = pages[info];
  if (!page) notFound();
  return pageMetadata(page.title, page.paragraphs[0], `/${info}`);
}
export function generateStaticParams() {
  return Object.keys(pages).map((info) => ({ info }));
}
export default async function InfoPage({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  const page = pages[info];
  if (!page) notFound();
  return (
    <div className="page-content prose">
      <h1>{page.title}</h1>
      {page.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {info === "terms" && <p><Link href="/licenses">Source code, licenses, and notices</Link></p>}
    </div>
  );
}
