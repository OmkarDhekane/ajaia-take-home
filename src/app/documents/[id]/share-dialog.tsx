"use client";

import { useActionState, useRef } from "react";
import { shareDocument } from "../../actions";

export type SharingPerson = {
  id: string;
  name: string;
  email: string;
  hasAccess: boolean;
};

export function ShareDialog({
  documentId,
  people,
}: {
  documentId: string;
  people: SharingPerson[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(
    shareDocument.bind(null, documentId),
    null,
  );
  const recipients = people.filter((person) => person.hasAccess);
  const available = people.filter((person) => !person.hasAccess);

  return (
    <>
      <button
        className="secondary"
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        Share
      </button>
      <dialog
        ref={dialog}
        className="share-dialog"
        aria-labelledby="share-heading"
      >
        <h2 id="share-heading">Share document</h2>
        <p className="status">Recipients can view the latest saved version.</p>
        {available.length > 0 && (
          <form action={action} className="share-form">
            <label htmlFor="recipient">Add a viewer</label>
            <select
              id="recipient"
              name="recipientId"
              defaultValue=""
              disabled={pending}
              required
            >
              <option value="" disabled>
                Choose an account
              </option>
              {available.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} ({person.email})
                </option>
              ))}
            </select>
            <button className="primary" disabled={pending}>
              {pending ? "Sharing…" : "Grant view access"}
            </button>
          </form>
        )}
        {state && "error" in state && (
          <p className="error" role="alert">
            {state.error}
          </p>
        )}
        {state && "success" in state && (
          <p className="status" role="status">
            View access granted.
          </p>
        )}
        <section
          className="share-people"
          aria-labelledby="share-people-heading"
        >
          <h3 id="share-people-heading">Viewers</h3>
          {recipients.length ? (
            <ul>
              {recipients.map((person) => (
                <li key={person.id}>
                  {person.name} <span className="status">({person.email})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="status">No viewers yet.</p>
          )}
        </section>
        <button
          className="secondary"
          type="button"
          onClick={() => dialog.current?.close()}
        >
          Done
        </button>
      </dialog>
    </>
  );
}
