# Architecture note

The first iteration prioritizes reliable editing, reopening, and a two-account sharing walkthrough. Explicit saves give owners a clear point at which their changes become visible to viewers. A failed save preserves the draft for retry.

Next.js App Router renders the dashboard and checks access on the server. Tiptap handles editing and read-only rendering. Server Actions validate writes against the same editor schema. Drizzle stores document titles and Tiptap JSON in SQLite, which keeps setup small and can support a single hosted instance with a persistent volume.

The demo uses two seeded accounts with scrypt password hashes and expiring sessions. An owner can edit and grant another account view access. The server checks ownership or a matching grant when reading a document, and checks ownership again for writes and sharing. A unique document-and-recipient pair makes repeated grants idempotent.

UTF-8 text import creates an ordinary editable document. Each line becomes a paragraph and markup stays literal. The app stores the resulting document in SQLite and discards the source file after conversion.

Each explicit save replaces the stored version. If the same owner edits in multiple tabs, the last save wins. Grants are view-only and additive. Real-time co-editing, autosave, version history, and broader file formats are outside this iteration.
