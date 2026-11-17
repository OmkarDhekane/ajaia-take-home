# Project Instructions

## Product goal

Build a focused, deployable collaborative document editor for the Ajaia take-home assessment. Prioritize complete, demonstrable core flows over broad feature coverage:

- Create, rename, edit, save, and reopen rich-text documents.
- Support bold, italic, underline, headings/text-size variation, and bulleted or numbered lists.
- Provide one clearly documented, product-relevant file-upload workflow.
- Support persistent document ownership and sharing between demonstrable users.
- Clearly distinguish owned and shared documents in the UI.

## Engineering priorities

- Choose simple, reliable dependencies and architecture that fit a 4–6 hour timebox.
- Persist documents, formatting/structure, and sharing data across refreshes.
- Keep access checks on the server or storage boundary; do not rely only on UI hiding.
- Include basic validation, useful error states, and at least one meaningful automated test.
- Prefer maintainable, conventional code over premature abstraction or optional enhancements.

## Delivery requirements

- Keep `README.md` current with setup, run, deployment, storage, supported upload types, and reviewer-access instructions.
- Add a short architecture note explaining implementation choices, tradeoffs, and scope cuts.
- Add an AI workflow note describing tools used, material acceleration, changed/rejected output, and verification.
- Add `SUBMISSION.md` with an exact inventory of deliverables and clearly document incomplete work plus next steps.
- Ensure the deployed experience can be evaluated without paid services or unavailable credentials.

## Quality checks

- Run formatting, linting, type checks, tests, and a production build when the selected stack provides them.
- Manually verify document creation, formatting persistence, upload behavior, sharing, and refresh/reopen behavior before submission.
- Do not commit secrets. Use environment variables for configuration and provide a safe example file when needed.
