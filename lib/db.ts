import { neon } from "@neondatabase/serverless";
export function db() {
  if (!process.env.DATABASE_URL)
    throw new Error(
      "Database is not configured. Connect Neon in Vercel to enable accounts and cloud saves.",
    );
  return neon(process.env.DATABASE_URL);
}
