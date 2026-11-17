# Project Requirements — Collaborative Document Editor

## 1. Project Overview

| Field | Details |
| --- | --- |
| Organization | Ajaia LLC |
| Assignment | AI-Native Full Stack Developer Assignment |
| Candidate | Omkar Dhekane |
| Candidate email | omkarjd1212@gmail.com |
| Product | Lightweight collaborative document editor inspired by Google Docs |
| Timebox | 4–6 hours maximum |

Build a small full stack application for internal teams to create, edit, upload, save, and share documents. Deliver a coherent, usable product slice that demonstrates product judgment, full stack capability, and practical use of AI tools while retaining engineering judgment.

Prioritize the strongest working version achievable within the timebox. Stop and submit the available work when the time limit is reached. A focused partial solution with clearly explained tradeoffs is acceptable.

## 2. Scope and Priorities

The core scope includes document creation and rich-text editing, a product-relevant file upload flow, simple sharing between users, persistent storage, and a deployment reviewers can access.

Keep the implementation intentionally scoped. Prioritize depth in a few important areas and explain deliberate scope cuts. Full Google Docs feature coverage and exact visual parity are outside the assignment scope.

## 3. Functional Requirements

### FR-01 — Document Creation and Editing

Users must be able to create a document, rename it, edit its content in the browser, save it, and reopen it.

The editor must support the following basic rich-text formatting.

- Bold
- Italic
- Underline
- Headings or text size variation
- Bulleted or numbered lists

**Acceptance criteria**

- A user can create and rename a document.
- A user can edit document content and apply the required formatting.
- A saved document can be reopened with its content and formatting or structure reasonably preserved.
- The editing flow feels usable and coherent.

### FR-02 — File Upload

Users must be able to upload at least one file through a product-relevant workflow. Choose an upload behavior appropriate to the implementation.

Acceptable examples include the following.

- Convert an uploaded `.txt`, `.md`, or `.docx` file into a new editable document.
- Associate an uploaded attachment with a document.
- Import file content into an existing draft.

These are examples of permitted approaches. The implementation may choose another product-relevant upload behavior.

**Acceptance criteria**

- A user can upload a supported file and complete the chosen workflow.
- Any file type restrictions are clearly stated in both the UI and `README.md`.

### FR-03 — Document Sharing

Implement a simple sharing model that allows one user to grant another user access to a document.

**Acceptance criteria**

- Each document has an owner.
- A user can grant another user access to a document.
- The receiving user can access the shared document according to the implemented sharing model.
- The UI visibly distinguishes owned documents from shared documents.
- Reviewers can demonstrate the sharing flow using the provided users or accounts.

Seeded accounts, mocked authentication, or a lightweight login flow are permitted. The sharing model must demonstrate clear intent and working access logic.

### FR-04 — Persistence

Persist document content and sharing data using a practical storage approach for the assignment scope.

**Acceptance criteria**

- Documents remain available after a page refresh.
- Saved formatting or document structure is reasonably preserved.
- Sharing data persists so that shared access behavior can be demonstrated.
- The chosen storage approach is documented.

Permitted storage options include SQLite, Postgres, Supabase, or a documented local file-based store.

## 4. Product and Engineering Requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| ER-01 | Setup and local execution | `README.md` contains clear setup and run instructions. |
| ER-02 | Deployment | A working live deployment is available for reviewers to test through the chosen deployment path. |
| ER-03 | Validation and errors | The application includes basic validation and error handling. |
| ER-04 | Automated testing | At least one meaningful automated test is included. |
| ER-05 | Architecture documentation | A short architecture note explains implementation priorities and the reasoning behind them. |
| ER-06 | Reviewer access | Reviewers can evaluate the product without paying for a dependency or service. |

## 5. Implementation Flexibility and Constraints

- Use any language, framework, editor library, or tooling stack.
- Use AI coding tools and assistants as appropriate while retaining engineering judgment.
- Choose the authentication, storage, upload behavior, sharing model, and deployment path to fit the timebox.
- Keep the core editing, upload, persistence, and sharing flows coherent and demonstrable.
- Explain prioritization, scope cuts, and tradeoffs in the submission.

## 6. AI Workflow Note

Provide a short note in Markdown or PDF covering all of the following.

- Which AI tools were used.
- Where AI materially accelerated the work.
- Which AI-generated output was changed or rejected.
- How correctness, UX quality, and implementation reliability were verified.

The assessment values practical AI usage and engineering judgment.

## 7. Walkthrough Video

Record a 3–5 minute walkthrough covering the following.

- The main user flow.
- Functionality that works end to end.
- Intentionally deprioritized functionality.
- Key implementation decisions.
- How AI supported the workflow.

An unlisted Loom or YouTube link is acceptable. Include the URL in a text file in the submission folder.

## 8. Submission Deliverables

Submit one Google Drive folder containing the following materials.

| Deliverable | Required content |
| --- | --- |
| Source code | Application source code. |
| `README.md` | Local setup and run instructions, including supported file types when restricted. |
| Architecture note | Short Markdown or PDF explanation of priorities, architecture, and tradeoffs. |
| AI workflow note | Markdown or PDF addressing the requirements in Section 6. |
| `SUBMISSION.md` | An exact inventory of the included materials. |
| Live product URL | A working deployed application that reviewers can test. |
| Walkthrough URL text file | Link to the 3–5 minute walkthrough video. |
| Review accounts | Credentials, seeded users, or test accounts needed to evaluate sharing, as applicable. |
| Screenshots or short demo GIF | Required if setup requires extra steps. |

The submission must provide the Google Drive folder link, the live deployment link, any necessary review credentials, and clear local execution instructions.

For any partial or incomplete feature, document the following.

- What works.
- What remains incomplete.
- What would be built next with another 2–4 hours.

## 9. Evaluation Criteria

- Translation of an open-ended prompt into a coherent product slice.
- Full stack execution across frontend, backend, persistence, and access logic.
- Quality of the document editing experience within the chosen scope.
- Practical file upload and sharing behavior.
- Infrastructure and deployment judgment, including a testable live build.
- Code clarity, maintainability, and delivery discipline.
- Prioritization and tradeoff awareness under time pressure.
- Written and verbal communication quality.
- Mature use of AI tools while maintaining engineering standards.

## 10. Optional Enhancements

If time remains after the core functionality is complete, add one small enhancement. Examples include the following.

- Real-time collaboration indicators.
- Commenting or suggestion mode.
- Document version history.
- Export to PDF or Markdown.
- Role-based sharing permissions beyond basic access.

Optional enhancements must fit within the timebox and preserve delivery of the core requirements.
