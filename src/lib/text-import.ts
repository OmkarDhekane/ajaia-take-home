import {
  createDocument,
  documentSizeError,
  maxDocumentBytes,
} from "./documents";
import { maxTitleLength } from "./editor-schema";
import { maxUploadBytes, uploadSizeError } from "./upload-limits";

export async function importTextDocument(
  db: Parameters<typeof createDocument>[0],
  ownerId: string,
  file: FormDataEntryValue | null,
): Promise<{ id: string } | { error: string }> {
  if (!(file instanceof File) || !file.name) {
    return { error: "Choose a .txt file to import." };
  }
  if (!file.name.toLowerCase().endsWith(".txt")) {
    return { error: "Only .txt files are supported." };
  }
  if (file.size > maxUploadBytes) return { error: uploadSizeError };

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(
      await file.arrayBuffer(),
    );
  } catch {
    return { error: "Choose a text file encoded as UTF-8." };
  }
  if (text.includes("\0")) {
    return { error: "Choose a UTF-8 plain-text file without binary data." };
  }
  if (!text.length) return { error: "The text file is empty." };

  const lines = text.split(/\r\n|\r|\n/, 10001);
  if (lines.length > 10000) {
    return { error: "Choose a text file with 10,000 lines or fewer." };
  }

  const title =
    file.name
      .slice(0, -4)
      .trim()
      .slice(0, maxTitleLength)
      .trimEnd()
      .toWellFormed() || "Untitled document";
  const contentJson = JSON.stringify({
    type: "doc",
    content: lines.map((line) =>
      line.length
        ? { type: "paragraph", content: [{ type: "text", text: line }] }
        : { type: "paragraph" },
    ),
  });
  if (Buffer.byteLength(contentJson) > maxDocumentBytes) {
    return { error: documentSizeError };
  }

  return { id: createDocument(db, ownerId, { title, contentJson }) };
}
