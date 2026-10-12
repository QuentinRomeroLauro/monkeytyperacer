import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";

// Only this public commit identifier is embedded; credentials stay server-side.
let sourceCommit = process.env.SOURCE_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA;
if (!sourceCommit) {
  try {
    sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    sourceCommit = "unversioned";
  }
}
if (process.env.VERCEL && !/^[a-f0-9]{40}$/.test(sourceCommit)) {
  throw new Error("Vercel builds require SOURCE_COMMIT_SHA or VERCEL_GIT_COMMIT_SHA to link the corresponding source.");
}
const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  env: { SOURCE_COMMIT_SHA: sourceCommit },
};
export default config;
