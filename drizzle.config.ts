import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please set it in your .env file. You can use your Supabase connection string."
  );
}

export default {
  schema: "./src/lib/db/schema",
  dialect: "postgresql",
  out: "./src/lib/db/migrations",
  dbCredentials: {
    url: DATABASE_URL,
  }
} satisfies Config;