import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { findDocument, listSharingPeople } from "@/lib/documents";
import { DocumentEditor } from "./editor";
import { DocumentViewer } from "./viewer";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([requireUser(), params]);
  const db = getDatabase();
  const document = findDocument(db, id, user.id);
  if (!document) notFound();

  if (document.ownerId !== user.id) {
    return (
      <>
        <header className="topbar editor-header">
          <Link href="/?view=shared" className="secondary back back-link">
            <span aria-hidden="true">←</span> Documents
          </Link>
          <span className="status">View only</span>
        </header>
        <main className="editing-area">
          <article className="sheet">
            <h1 className="viewer-title">{document.title}</h1>
            <p className="viewer-owner status">Owner: {document.ownerName}</p>
            <DocumentViewer contentJson={document.contentJson} />
          </article>
        </main>
      </>
    );
  }

  return (
    <DocumentEditor
      key={id}
      id={id}
      initialTitle={document.title}
      initialContent={document.contentJson}
      sharingPeople={listSharingPeople(db, id, user.id)}
    />
  );
}
