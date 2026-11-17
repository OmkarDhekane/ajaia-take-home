import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { listDocuments, listSharedDocuments } from "@/lib/documents";
import { signOut } from "./actions";
import { CreateDocumentForm, ImportTextMenu } from "./forms";

const formatDate = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function DocumentList({
  documents,
  emptyTitle,
  emptyMessage,
}: {
  documents: (ReturnType<typeof listDocuments>[number] & {
    ownerName?: string;
  })[];
  emptyTitle: string;
  emptyMessage: string;
}) {
  if (!documents.length) {
    return (
      <div className="empty-state">
        <span className="document-icon" aria-hidden="true">
          ≡
        </span>
        <h3>{emptyTitle}</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="document-list">
      {documents.map((doc) => (
        <li key={doc.id}>
          <Link className="document-link" href={`/documents/${doc.id}`}>
            <span className="document-icon" aria-hidden="true">
              ≡
            </span>
            <span className="document-name">
              {doc.title}
              {doc.ownerName && (
                <span className="document-owner">Owner: {doc.ownerName}</span>
              )}
            </span>
            <time dateTime={new Date(doc.updatedAt).toISOString()}>
              {formatDate.format(doc.updatedAt)}
            </time>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const [user, { view }] = await Promise.all([requireUser(), searchParams]);
  const db = getDatabase();
  const showShared = view === "shared";

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            A
          </span>{" "}
          Ajaia Docs
        </div>
        <div className="account">
          <span>{user.displayName}</span>
          <form action={signOut}>
            <button className="secondary">Sign out</button>
          </form>
        </div>
      </header>
      <main className="dashboard">
        <div className="dashboard-actions">
          <CreateDocumentForm />
          <ImportTextMenu />
        </div>
        <section
          className="documents-panel"
          aria-labelledby="documents-heading"
        >
          <div className="documents-panel-header">
            <h1 id="documents-heading">Documents</h1>
            <nav className="document-views" aria-label="Document views">
              <Link href="/" aria-current={showShared ? undefined : "page"}>
                Owned by me
              </Link>
              <Link
                href="/?view=shared"
                aria-current={showShared ? "page" : undefined}
              >
                Shared with me
              </Link>
            </nav>
          </div>
          <div
            role="region"
            aria-label={showShared ? "Shared with me" : "Owned by me"}
          >
            {showShared ? (
              <DocumentList
                documents={listSharedDocuments(db, user.id)}
                emptyTitle="No shared documents yet"
                emptyMessage="Documents others share with you will appear here."
              />
            ) : (
              <DocumentList
                documents={listDocuments(db, user.id)}
                emptyTitle="No documents yet"
                emptyMessage="Create a blank document or import a text file."
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
