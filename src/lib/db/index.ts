import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDatabase(path: string) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path);
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite);
}

let db: ReturnType<typeof openDatabase> | undefined;

export function getDatabase() {
  db ??= openDatabase(process.env.DATABASE_PATH || "./data/ajaia.sqlite");
  return db;
}
