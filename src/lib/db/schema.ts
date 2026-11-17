import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  displayName: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
});

export const sessions = sqliteTable("sessions", {
  tokenHash: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer().notNull(),
});

export const documents = sqliteTable("documents", {
  id: text().primaryKey(),
  ownerId: text()
    .notNull()
    .references(() => users.id),
  title: text().notNull(),
  contentJson: text().notNull(),
  createdAt: integer().notNull(),
  updatedAt: integer().notNull(),
});

export const documentShares = sqliteTable(
  "document_shares",
  {
    documentId: text()
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    recipientId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.documentId, table.recipientId] }),
    index("document_shares_recipient_idx").on(table.recipientId),
  ],
);
