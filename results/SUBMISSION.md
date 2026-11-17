# Iteration 1 submission inventory

| File                                     | Contents                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| [README.md](README.md)                   | Local setup, core workflows, upload restrictions, storage, and deployment plan |
| [ARCHITECTURE.md](ARCHITECTURE.md)       | Design priorities, implementation choices, and scope tradeoffs                 |
| [AI-WORKFLOW.md](AI-WORKFLOW.md)         | AI tooling, revisions to generated output, and verification                    |
| [REVIEW-ACCOUNTS.md](REVIEW-ACCOUNTS.md) | Seeded local credentials and the two-account sharing walkthrough               |
| [SUBMISSION.md](SUBMISSION.md)           | This inventory and iteration status                                            |

The application source, lockfile, migrations, seed script, and tests are in the parent repository.

## Implemented and verified locally

Seeded sign-in, document creation and editing, formatted saves and reopening, UTF-8 text import, and view-only sharing. Documents and grants were verified after restart. The 14 automated tests and production build passed.

## Pending for final submission

- A working HTTPS reviewer URL with a persistent SQLite volume and hosted demo credentials.
- A 3–5 minute walkthrough video and a text file linking to it.
- The final Google Drive submission folder with the source and reviewer materials.

The next 2–4 hours would cover deployment, a live walkthrough with both accounts including a restart check, and recording and packaging the final submission.
