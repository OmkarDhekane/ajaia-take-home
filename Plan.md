# Collaborative Document Editor

## Goal and scope

Build a lightweight, Google Docs-inspired editor for a small internal team. A reviewer can sign in, create and format a document, save and reopen it, import a text file, and grant a second reviewer view-only access.

The first version runs locally with SQLite, uses an explicit Save action, imports UTF-8 `.txt` files, and provides two seeded accounts with email and password sign-in. Cloud hosting follows the local build and remains an assessment submission requirement. Autosave, real-time co-editing, comments, version history, and broader import formats are outside the MVP.

## Core screens

| Screen | Behavior |
| --- | --- |
| Sign-in | Accept the email and password for either seeded account. Show an error for invalid credentials. The app header identifies the signed-in user and offers sign-out. |
| Documents dashboard | Create a blank document or import a text file. Separate **Owned by me** from **Shared with me** and show an empty state for each section. |
| Owner editor | Edit the title and body. Support bold, italic, underline, headings, bulleted lists, and numbered lists. Provide **Save** and **Share** actions, with clear unsaved, saving, saved, and failed states. |
| Shared document | Render the saved title and rich text in a read-only view. Show the owner and the user's view-only access. |
| Share dialog | Let the owner select the other seeded account, grant view access, and see existing recipients. |

## User flows

1. **Sign in.** Submit seeded credentials. The server verifies the password and creates a session. The dashboard loads the signed-in user's documents. To verify sharing as the second account, sign out and sign back in or use a separate browser session.
2. **Create, edit, and save.** Create a blank owned document, rename it, apply formatting, and click **Save**. Save the title and body together. Keep local edits available for retry if saving fails, and warn before leaving with unsaved edits. Reopen or refresh after a successful save to verify persistence.
3. **Import a text file.** Select a UTF-8 `.txt` file from the dashboard. Validate the extension, encoding, and a proposed 1 MiB limit on the server. Convert the text into editable paragraphs, use the filename stem as the title, and open the new saved document. Display the format and size limit in the UI and README.
4. **Share and verify.** Open **Share** as the owner and grant access to the other account. As the recipient, open the document from **Shared with me** and verify the saved formatting. Reload after an owner save to see the latest saved version. Confirm that the recipient cannot edit or reshare the document, including through a direct API request.

## Data model

| Model | Fields and constraints |
| --- | --- |
| `User` | `id`, `displayName`, unique normalized `email`, and `passwordHash`. Seed two users for the walkthrough. |
| `Session` | `tokenHash`, `userId`, and `expiresAt`. Store the opaque token in an HTTP-only cookie, require HTTPS for the deployed cookie, and invalidate the session on sign-out. |
| `Document` | `id`, `ownerId` referencing `User`, `title`, `contentJson` stored as SQLite text, `createdAt`, and `updatedAt`. Imported documents use the same model. |
| `DocumentShare` | `documentId`, `recipientId`, and `createdAt`. The document and recipient form a unique pair so repeated grants are idempotent. Each grant confers view access. |

Resolve the current user and enforce access on the server for every document operation. Owners may read, update, and share. Recipients may read. All other users are denied access, including when they request a document directly by ID. Hash seeded passwords and supply them to the seed script through environment variables. Keep the SQLite database and real credentials out of version control.

## Tech stack

- **Application and API** — Next.js App Router and TypeScript, with route handlers running in the Node.js runtime.
- **Rich text** — Tiptap. Use the same supported schema for editing and server-side validation of saved document JSON. Treat imported file content as plain text.
- **Storage** — SQLite with Drizzle ORM, the `better-sqlite3` driver, checked-in migrations, and a repeatable seed command. Configure the database path through an environment variable.
- **Testing** — Vitest with a temporary SQLite database for the sharing authorization flow. Verify that an unshared account cannot read a document, a recipient can read it after a grant, and only the owner can edit or share it.
- **Later deployment** — Choose a Node.js host with a persistent volume for SQLite and run a single app instance for the demo. Verify that documents and grants survive a service restart. If the chosen host lacks persistent storage, revisit the database choice before deploying. Reviewers should need only the live URL and seeded credentials.

## Implementation and verification

1. Set up the local app, database migrations, seeded accounts, and credential sign-in.
2. Implement the dashboard and the create, rename, edit, save, and reopen flow.
3. Add text import, view-only sharing, and authorization tests.
4. Run lint, type checks, tests, and a production build. Use both accounts to verify formatting persistence, import validation, and sharing. Check persistence after an app restart.
5. Deploy and repeat the reviewer walkthrough on the live URL before submission. Prioritize the core flows within the assessment's 4–6 hour timebox and record any unfinished work.

## Submission

Provide one Google Drive folder with the source, a README covering setup, seed commands, storage, upload limits and reviewer access, a short architecture note, an AI workflow note, and `SUBMISSION.md` listing the exact contents. Include the live URL, seeded reviewer credentials, and a text file linking to the 3–5 minute walkthrough. Add screenshots or a short GIF if setup needs extra steps. For incomplete work, state what works, what remains, and what another 2–4 hours would cover.
