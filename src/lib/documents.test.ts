import { migrate } from "drizzle-orm/libsql/migrator";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type Database, openDatabase } from "./db";
import { users } from "./db/schema";
import {
  createDocument,
  findDocument,
  grantDocumentAccess,
  listDocuments,
  listSharedDocuments,
  listSharingPeople,
  saveDocument,
} from "./documents";
import { emptyDocument } from "./editor-schema";
import { importTextDocument } from "./text-import";
import { maxUploadBytes } from "./upload-limits";

let db: Database;
let directory: string;

// libSQL opens a new connection after each transaction, so an in-memory
// database would be lost; use a throwaway file per test instead.
beforeEach(async () => {
  directory = mkdtempSync(join(tmpdir(), "ajaia-test-"));
  db = openDatabase(`file:${join(directory, "test.sqlite")}`);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await db
    .insert(users)
    .values([
      {
        id: "alex",
        displayName: "Alex Chen",
        email: "alex@example.test",
        passwordHash: "unused",
      },
      {
        id: "sam",
        displayName: "Sam Rivera",
        email: "sam@example.test",
        passwordHash: "unused",
      },
    ])
    .run();
});

afterEach(() => {
  db.$client.close();
  try {
    rmSync(directory, { recursive: true, force: true });
  } catch {
    // Windows may still hold a lock from libSQL's transaction connections.
  }
});

describe("document persistence", () => {
  it("creates a document and reopens its saved title and rich text", async () => {
    const id = await createDocument(db, "alex");
    expect(await findDocument(db, id, "alex")).toMatchObject({
      title: "Untitled document",
      contentJson: JSON.stringify(emptyDocument),
    });

    const listItem = {
      type: "listItem",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Item" }] },
      ],
    };
    const body = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            {
              type: "text",
              text: "Agenda",
              marks: [
                { type: "bold" },
                { type: "italic" },
                { type: "underline" },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: ["bold", "italic", "underline"].map((type) => ({
            type: "text",
            text: type,
            marks: [{ type }],
          })),
        },
        { type: "bulletList", content: [listItem] },
        {
          type: "orderedList",
          attrs: { start: 1, type: null },
          content: [listItem],
        },
      ],
    };

    expect(
      await saveDocument(
        db,
        id,
        "alex",
        "  Project notes ",
        JSON.stringify(body),
      ),
    ).toEqual({
      title: "Project notes",
    });
    expect(await listDocuments(db, "alex")).toMatchObject([
      { id, title: "Project notes" },
    ]);
    expect(
      JSON.parse((await findDocument(db, id, "alex"))!.contentJson),
    ).toEqual(body);
  });

  it("keeps someone else's document out of reads, lists, and writes", async () => {
    const id = await createDocument(db, "alex");

    expect(await listDocuments(db, "sam")).toEqual([]);
    expect(await findDocument(db, id, "sam")).toBeUndefined();
    expect(
      await saveDocument(
        db,
        id,
        "sam",
        "Changed",
        JSON.stringify(emptyDocument),
      ),
    ).toEqual({
      error: "Document not found.",
    });
    expect((await findDocument(db, id, "alex"))?.title).toBe(
      "Untitled document",
    );
  });

  it("leaves the last save intact after invalid title or body submissions", async () => {
    const id = await createDocument(db, "alex");
    expect(
      await saveDocument(db, id, "alex", "   ", JSON.stringify(emptyDocument)),
    ).toHaveProperty("error");
    expect(
      await saveDocument(
        db,
        id,
        "alex",
        "Valid title",
        JSON.stringify({
          type: "doc",
          content: [
            { type: "image", attrs: { src: "https://example.test/test.png" } },
          ],
        }),
      ),
    ).toHaveProperty("error");
    expect((await findDocument(db, id, "alex"))?.title).toBe(
      "Untitled document",
    );
  });
});

describe("text file import", () => {
  it("persists the filename and plain UTF-8 paragraphs under the importer", async () => {
    const file = new File(
      ["\uFEFFFirst line\r\n\r\nCafé <b>literal</b>\rLast line\n"],
      "  Quarterly notes.TXT",
    );
    const result = await importTextDocument(db, "alex", file);
    expect(result).toHaveProperty("id");
    if (!("id" in result)) throw new Error(result.error);

    const document = (await findDocument(db, result.id, "alex"))!;
    expect(document).toMatchObject({
      ownerId: "alex",
      title: "Quarterly notes",
    });
    expect(await findDocument(db, result.id, "sam")).toBeUndefined();
    expect(JSON.parse(document.contentJson)).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "First line" }] },
        { type: "paragraph" },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Café <b>literal</b>" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "Last line" }] },
        { type: "paragraph" },
      ],
    });
    expect(
      await saveDocument(
        db,
        result.id,
        "alex",
        "Renamed",
        document.contentJson,
      ),
    ).toEqual({ title: "Renamed" });
  });

  it("accepts and can save a document from a file at the 1 MiB limit", async () => {
    const file = new File(["a".repeat(maxUploadBytes)], "at-limit.txt");
    const result = await importTextDocument(db, "alex", file);
    if (!("id" in result)) throw new Error(result.error);
    const document = (await findDocument(db, result.id, "alex"))!;

    expect(
      await saveDocument(
        db,
        result.id,
        "alex",
        "Large document",
        document.contentJson,
      ),
    ).toEqual({ title: "Large document" });
  });

  it.each([
    ["missing file", null, "Choose a .txt file to import."],
    [
      "wrong extension",
      new File(["Text"], "notes.md", { type: "text/plain" }),
      "Only .txt files are supported.",
    ],
    [
      "invalid UTF-8",
      new File([new Uint8Array([0xc3, 0x28])], "broken.txt"),
      "Choose a text file encoded as UTF-8.",
    ],
    [
      "binary data",
      new File(["bad\0data"], "binary.txt"),
      "Choose a UTF-8 plain-text file without binary data.",
    ],
    [
      "oversize file",
      new File([new Uint8Array(maxUploadBytes + 1)], "large.txt"),
      "Choose a file that is 1 MiB or smaller.",
    ],
    ["empty file", new File([], "empty.txt"), "The text file is empty."],
    [
      "excessive line count",
      new File(["x\n".repeat(10000) + "x"], "lines.txt"),
      "Choose a text file with 10,000 lines or fewer.",
    ],
  ])("rejects %s without creating a document", async (_, file, error) => {
    expect(await importTextDocument(db, "alex", file)).toEqual({ error });
    expect(await listDocuments(db, "alex")).toEqual([]);
  });
});

describe("view-only sharing", () => {
  it("makes the saved document visible to the selected account only", async () => {
    await db
      .insert(users)
      .values({
        id: "another-user",
        displayName: "Another User",
        email: "another@example.test",
        passwordHash: "unused",
      })
      .run();
    const id = await createDocument(db, "alex");
    expect(await findDocument(db, id, "sam")).toBeUndefined();
    expect(await listSharedDocuments(db, "sam")).toEqual([]);
    expect(await listSharingPeople(db, id, "sam")).toEqual([]);

    expect(await grantDocumentAccess(db, id, "alex", "sam")).toEqual({
      success: true,
    });
    expect(await grantDocumentAccess(db, id, "alex", "sam")).toEqual({
      success: true,
    });
    expect(await listDocuments(db, "sam")).toEqual([]);
    expect(await listSharedDocuments(db, "sam")).toMatchObject([
      { id, ownerName: "Alex Chen" },
    ]);
    expect(await listSharedDocuments(db, "alex")).toEqual([]);
    expect(await listSharingPeople(db, id, "alex")).toMatchObject([
      { id: "another-user", hasAccess: false },
      { id: "sam", hasAccess: true },
    ]);
    expect(await findDocument(db, id, "another-user")).toBeUndefined();
    expect(await listSharedDocuments(db, "another-user")).toEqual([]);
    expect(await listSharingPeople(db, id, "sam")).toEqual([]);

    const contentJson = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            { type: "text", text: "Latest", marks: [{ type: "bold" }] },
          ],
        },
      ],
    });
    expect(
      await saveDocument(db, id, "alex", "Shared notes", contentJson),
    ).toEqual({
      title: "Shared notes",
    });
    const savedDocument = (await findDocument(db, id, "alex"))!;
    expect(JSON.parse(savedDocument.contentJson)).toEqual(
      JSON.parse(contentJson),
    );
    expect(await findDocument(db, id, "sam")).toMatchObject({
      title: "Shared notes",
      contentJson: savedDocument.contentJson,
      ownerName: "Alex Chen",
    });
    expect(
      await saveDocument(
        db,
        id,
        "sam",
        "Attempted edit",
        JSON.stringify(emptyDocument),
      ),
    ).toEqual({
      error: "Document not found.",
    });
    expect(await grantDocumentAccess(db, id, "sam", "another-user")).toEqual({
      error: "Document not found.",
    });
    expect(await findDocument(db, id, "alex")).toEqual(savedDocument);
    expect(await findDocument(db, id, "another-user")).toBeUndefined();
  });

  it("rejects self-shares and unknown recipients", async () => {
    const id = await createDocument(db, "alex");
    for (const recipient of ["alex", "missing"]) {
      expect(await grantDocumentAccess(db, id, "alex", recipient)).toEqual({
        error: "Choose another account to share with.",
      });
    }
    expect(await listSharingPeople(db, id, "alex")).toMatchObject([
      { id: "sam", hasAccess: false },
    ]);
  });
});
