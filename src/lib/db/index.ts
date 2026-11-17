import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const defaultUrl = "file:./data/ajaia.sqlite";

/**
 * Opens a libSQL database. Use a `libsql://` URL plus auth token for Turso,
 * or a `file:` URL for local development and tests.
 */
export function openDatabase(url: string, authToken?: string) {
  if (url.startsWith("file:")) {
    mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
  }
  return drizzle(createClient({ url, authToken: authToken || undefined }));
}

export type Database = ReturnType<typeof openDatabase>;

let db: Database | undefined;

export function getDatabase() {
  db ??= openDatabase(
    process.env.TURSO_DATABASE_URL || defaultUrl,
    process.env.TURSO_AUTH_TOKEN,
  );
  return db;
}
