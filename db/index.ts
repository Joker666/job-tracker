import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to connect to the database.");
}

const client = postgres(databaseUrl, {
  prepare: false,
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  connection: {
    statement_timeout: 15_000,
    lock_timeout: 5_000,
    idle_in_transaction_session_timeout: 15_000,
  },
});

export const db = drizzle(client, { schema });
