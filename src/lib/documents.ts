import { getSchema } from "@tiptap/core";
import { and, desc, eq, isNotNull, ne, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { openDatabase } from "./db";
import { documents, documentShares, users } from "./db/schema";
import {
  editorExtensions,
  emptyDocument,
  maxTitleLength,
} from "./editor-schema";

const schema = getSchema(editorExtensions);
export const maxDocumentBytes = 2 * 1024 * 1024;
export const documentSizeError = "The document exceeds the 2 MiB size limit.";
type Database = ReturnType<typeof openDatabase>;

export function listDocuments(db: Database, ownerId: string) {
  return db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.ownerId, ownerId))
    .orderBy(desc(documents.updatedAt))
    .all();
}

function ownedDocument(id: string, ownerId: string) {
  return and(eq(documents.id, id), eq(documents.ownerId, ownerId));
}

export function findDocument(db: Database, id: string, userId: string) {
  return db
    .select({
      id: documents.id,
      ownerId: documents.ownerId,
      ownerName: users.displayName,
      title: documents.title,
      contentJson: documents.contentJson,
    })
    .from(documents)
    .innerJoin(users, eq(users.id, documents.ownerId))
    .leftJoin(
      documentShares,
      and(
        eq(documentShares.documentId, documents.id),
        eq(documentShares.recipientId, userId),
      ),
    )
    .where(
      and(
        eq(documents.id, id),
        or(
          eq(documents.ownerId, userId),
          isNotNull(documentShares.recipientId),
        ),
      ),
    )
    .get();
}

export function listSharedDocuments(db: Database, recipientId: string) {
  return db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
      ownerName: users.displayName,
    })
    .from(documentShares)
    .innerJoin(documents, eq(documents.id, documentShares.documentId))
    .innerJoin(users, eq(users.id, documents.ownerId))
    .where(eq(documentShares.recipientId, recipientId))
    .orderBy(desc(documents.updatedAt))
    .all();
}

export function listSharingPeople(
  db: Database,
  documentId: string,
  ownerId: string,
) {
  // The owner-only page supplies the document; bind the query to that owner too.
  return db
    .select({
      id: users.id,
      name: users.displayName,
      email: users.email,
      hasAccess: isNotNull(documentShares.recipientId).mapWith(Boolean),
    })
    .from(users)
    .innerJoin(documents, ownedDocument(documentId, ownerId))
    .leftJoin(
      documentShares,
      and(
        eq(documentShares.documentId, documents.id),
        eq(documentShares.recipientId, users.id),
      ),
    )
    .where(ne(users.id, ownerId))
    .orderBy(users.displayName)
    .all();
}

export function grantDocumentAccess(
  db: Database,
  documentId: string,
  ownerId: string,
  recipientId: string,
): { success: true } | { error: string } {
  return db.transaction((tx) => {
    const document = tx
      .select({ id: documents.id })
      .from(documents)
      .where(ownedDocument(documentId, ownerId))
      .get();
    if (!document) return { error: "Document not found." };

    const recipient = tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, recipientId), ne(users.id, ownerId)))
      .get();
    if (!recipient) return { error: "Choose another account to share with." };

    tx.insert(documentShares)
      .values({ documentId, recipientId, createdAt: Date.now() })
      .onConflictDoNothing()
      .run();
    return { success: true };
  });
}

export function createDocument(
  db: Database,
  ownerId: string,
  initial = {
    title: "Untitled document",
    contentJson: JSON.stringify(emptyDocument),
  },
) {
  const now = Date.now();
  const id = randomUUID();
  db.insert(documents)
    .values({
      id,
      ownerId,
      ...initial,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function saveDocument(
  db: Database,
  id: string,
  ownerId: string,
  rawTitle: unknown,
  serialized: unknown,
): { title: string } | { error: string } {
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (!title || title.length > maxTitleLength) {
    return {
      error: `Enter a title between 1 and ${maxTitleLength} characters.`,
    };
  }

  let contentJson: string;
  try {
    if (typeof serialized !== "string" || !serialized)
      return { error: "The document content is invalid." };
    if (Buffer.byteLength(serialized) > maxDocumentBytes) {
      return { error: documentSizeError };
    }
    const node = schema.nodeFromJSON(JSON.parse(serialized));
    if (node.type !== schema.topNodeType)
      throw new Error("Invalid document root");
    node.check();
    node.descendants((child) => {
      if (
        child.type.name === "heading" &&
        ![1, 2, 3].includes(child.attrs.level)
      ) {
        throw new Error("Unsupported heading level");
      }
    });
    contentJson = JSON.stringify(node.toJSON());
  } catch {
    return { error: "The document contains unsupported formatting." };
  }

  const updatedAt = Date.now();
  const result = db
    .update(documents)
    .set({ title, contentJson, updatedAt })
    .where(ownedDocument(id, ownerId))
    .run();
  if (result.changes === 0) return { error: "Document not found." };
  return { title };
}
