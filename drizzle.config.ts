import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: DATABASE_URL presence is verified during drizzle configuration parsing
    url: process.env.DATABASE_URL!,
  },
});
