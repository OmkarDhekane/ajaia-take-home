# Ajaia Docs · Iteration 1

A collaborative document editor for the Ajaia take-home assessment. This iteration supports seeded sign-in, rich-text editing, plain-text import, and view-only sharing.

## Run locally

Use Node.js 22.13 or newer and npm. Run these commands from the repository root, one level above this folder.

```powershell
npm ci
Copy-Item .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

On macOS or Linux, use `cp .env.example .env` for the copy step. If you already have a configured `.env`, keep it. Open [Ajaia Docs locally](http://localhost:3000) and sign in using the [review accounts](REVIEW-ACCOUNTS.md).

## Try the core flows

- **Create and edit.** Select **New document**, name it, and add text. Try bold, italic, underline, headings, and both list types. Click **Save** and look for the brief confirmation. Refresh or reopen the document to confirm your changes persisted.
- **Import.** Open **Import** beside **New document**, choose a UTF-8 `.txt` file, and click **Upload file**. The filename becomes the title and line breaks become paragraphs. Imports must contain text and fit within 1 MiB and 10,000 lines. The resulting document must fit the 2 MiB document JSON limit.
- **Share.** Open an owned document, click **Share**, and grant the other seeded account view access. The recipient selects **Shared with me** in the document list and opens it there. The [two-account walkthrough](REVIEW-ACCOUNTS.md#verify-sharing) covers the full check.

## Storage and deployment

SQLite stores accounts, sessions, documents, and sharing grants. `DATABASE_PATH` defaults to `./data/ajaia.sqlite`. Keep the database directory between runs.

The deployment plan is a single Node.js instance on HTTPS with a writable persistent volume. Point `DATABASE_PATH` at that volume, configure unique demo passwords, run migrations and seeding, then run `npm run build` and `npm start`. Keep secure session cookies enabled on the host. For a production-mode preview over local HTTP, use `SESSION_COOKIE_SECURE=false` in the local `.env`.

The live reviewer URL is pending. This package supports local review.

## Engineering checks

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

See the [submission inventory](SUBMISSION.md) for the remaining deliverables.
