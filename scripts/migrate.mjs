import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
if (!process.env.DATABASE_URL)
  throw new Error(
    "DATABASE_URL is missing. Run vercel env pull .env.local first.",
  );
const sql = neon(process.env.DATABASE_URL);
const statements = (
  await readFile(new URL("../lib/schema.sql", import.meta.url), "utf8")
)
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);
for (const statement of statements) await sql.query(statement);
console.log("Database schema ready.");
