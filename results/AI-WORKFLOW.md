# AI workflow note

OpenAI Codex helped turn the assessment plan into the Next.js project, Tiptap editor, SQLite migrations, and initial tests. It accelerated the implementation of seeded sign-in, text import, and the two-account sharing flow. The Codex browser preview was used to exercise the production build with both demo accounts.

## Changes made after review

- An early browser-only storage proposal was dropped in favor of server-side SQLite and seeded sign-in to support durable ownership and access checks.
- A browser test exposed a save failure when several formatting controls were combined. The editor was changed to send serialized JSON through the Server Action, and the persistence test was expanded to cover combined formatting.
- The original document size ceiling was raised after checking that a file near the 1 MiB import limit also needed to be editable and savable. The request limit was adjusted to allow for multipart and JSON encoding.
- The first Render deploy failed because the app could not create a SQLite directory without a persistent disk. Claude Code moved storage to libSQL/Turso, converted data access to async queries, and changed the tests to use temporary libSQL files, because libSQL opens a new connection after each transaction and an in-memory database would be lost.
- The recipient's editor surface was given a reading-document accessibility role after the preview exposed Tiptap's default textbox role.

## Verification

Formatting, lint, type checking, all 14 Vitest tests, and a production build passed. A fresh SQLite database was migrated and seeded successfully.

Browser walkthroughs covered sign-in, formatted save and reopen, invalid upload rejection, valid import and edit, and the owner-to-viewer sharing flow. A fresh process reopened a test database and verified the saved structure and grants. Direct save and share requests made as a viewer were rejected after restarting the local production preview.
