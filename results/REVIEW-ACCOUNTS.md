# Review accounts

Run the [local setup](README.md#run-locally), including `npm run db:seed`, and open [Ajaia Docs locally](http://localhost:3000). These are seeded demo credentials from the repository's `.env.example`. If the local environment uses different seed passwords, use those configured values.

| Account    | Email               | Local demo password | Walkthrough role                      |
| ---------- | ------------------- | ------------------- | ------------------------------------- |
| Alex Chen  | `alex@example.test` | `local-alex-demo`   | Owner of the example document         |
| Sam Rivera | `sam@example.test`  | `local-sam-demo`    | Viewer after Alex shares the document |

Either account can create and own its own documents. The roles above apply to the example document. Hosted credentials are pending.

## Verify sharing

1. Sign in as Alex. Create a document named **Reviewer notes**, add a heading and a short bulleted list, and click **Save**.
2. Click **Share**, select **Sam Rivera**, and click **Grant view access**. Confirm Sam is listed under **Viewers**.
3. Return to **Documents**, sign out, and sign in as Sam. Select **Shared with me** on the right of the document list and open **Reviewer notes**.
4. Confirm the formatting, **View only** label, and Alex's name. Refresh the page to confirm the document is still accessible.
5. For the update check, sign back in as Alex and save a change. Reopen the document as Sam and confirm the updated version is visible.
