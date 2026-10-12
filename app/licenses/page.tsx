import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import fonts from "@/public/licenses/fonts.json";
import dependencies from "@/public/licenses/dependencies.json";

export const metadata = pageMetadata("Source & licenses", "Source code, copyright notices, and third-party licenses for Monkeytype Racer.", "/licenses");

export default function LicensesPage() {
  const repository = "https://github.com/QuentinRomeroLauro/monkeytyperacer";
  const commit = process.env.SOURCE_COMMIT_SHA || "unversioned";
  const revision = /^[a-f0-9]{40}$/.test(commit) ? commit : "master";
  return (
    <div className="page-content prose">
      <h1>source & licenses</h1>
      <p>Monkeytype Racer is free software, licensed under the <a href="/licenses/GPL-3.0.txt">GNU General Public License, version 3</a>. You may use, study, modify, and redistribute it under that license, including commercially.</p>
      <p>Copyright © 2026 Quentin Romero Lauro and contributors. Portions derived from Monkeytype are copyright Miodec and the Monkeytype contributors. This modified work is independent of, and is not endorsed by, Monkeytype or TypeRacer.</p>
      <p>Modified on October 11, 2026: rebuilt the application in Next.js and React, added multiplayer racing, independent accounts and storage, a custom roadster identity, and a book-quote collection. See the <a href={`${repository}/commits/${revision}`}>dated change history</a> for subsequent modifications.</p>
      <p>This program comes WITHOUT ANY WARRANTY, including implied warranties of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE, to the extent permitted by law. See sections 15–17 of the GPL for details.</p>
      <h2>source for this version</h2>
      <p><a href={`${repository}/tree/${revision}`}>Browse the source</a> or <a href={`${repository}/archive/${revision}.zip`}>download it at no charge</a>. The source includes the application, assets, dependency lockfile, database schema, and build scripts. <a href={`${repository}/blob/${revision}/docs/development.md`}>Build and installation instructions</a> are included.</p>
      <p>{revision === "master" ? "This is an unversioned local build; the links show the current public repository." : <>Source revision: <code style={{ overflowWrap: "anywhere" }}>{commit}</code>.</>}</p>
      <h2>credits & asset licenses</h2>
      <p><a href="/licenses/THIRD_PARTY_NOTICES.txt">Third-party notices</a> identify the upstream Monkeytype version, author credits, book sources, and the scope of each license. Fonts and other separately licensed assets retain their own terms; the GPL does not replace them.</p>
      <p>The <a href="/licenses/word-list-sources.json">word-list source notices</a> preserve embedded attributions, including the Norwegian lists from Språkbanken Nasjonalbiblioteket under <a href="/licenses/CC-BY-4.0.txt">CC-BY 4.0</a>. The inherited quote collections and some external word-list rights remain under review; their inclusion is not a claim of clearance.</p>
      <details>
        <summary>Font licenses and copyright notices</summary>
        <ul>{fonts.map((font) => <li key={font.file}>{font.file.split("/").pop()}: <a href={font.licenseFile}>{font.license}</a> · <a href={font.noticeFile}>copyright & notices</a></li>)}</ul>
      </details>
      <details>
        <summary>Dependency licenses and notices</summary>
        <ul>{dependencies.map((dependency) => <li key={dependency.name}>{dependency.name} {dependency.versions.join(", ")} — {dependency.license}{dependency.notices.map((notice, index) => <span key={notice}> · <a href={notice}>notice {index + 1}</a></span>)}</li>)}</ul>
      </details>
      <p><a href={`${repository}/blob/${revision}/docs/license-audit.md`}>Asset and branding audit</a> · <Link href="/about">About this project</Link></p>
    </div>
  );
}
