"use client";

import { useActionState, useRef, useState } from "react";
import { maxUploadBytes, uploadSizeError } from "@/lib/upload-limits";
import { createBlankDocument, importDocument, signIn } from "./actions";

export function CreateDocumentForm() {
  const [state, action, pending] = useActionState(createBlankDocument, null);

  return (
    <form action={action} className="create-form">
      <button className="primary" disabled={pending}>
        <span aria-hidden="true">+</span>{" "}
        {pending ? "Creating…" : "New document"}
      </button>
      {state?.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function ImportTextMenu() {
  const [state, action, pending] = useActionState(importDocument, null);
  const [oversized, setOversized] = useState(false);
  const [open, setOpen] = useState(false);
  const error = oversized ? uploadSizeError : state?.error;
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="import-menu"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="secondary import-trigger"
        aria-expanded={open}
        aria-controls="import-form"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        Import <span aria-hidden="true">▾</span>
      </button>
      <form
        action={action}
        id="import-form"
        className="import-form"
        hidden={!open}
        onSubmit={(event) => {
          if (oversized) event.preventDefault();
        }}
      >
        <label htmlFor="text-file">Upload a .txt file</label>
        <p id="import-help">UTF-8 .txt files up to 1 MiB and 10,000 lines.</p>
        <input
          id="text-file"
          name="file"
          type="file"
          accept=".txt,text/plain"
          required
          disabled={pending}
          aria-describedby={error ? "import-help import-error" : "import-help"}
          onChange={(event) =>
            setOversized((event.target.files?.[0]?.size ?? 0) > maxUploadBytes)
          }
        />
        <button className="primary" disabled={pending || oversized}>
          {pending ? "Uploading…" : "Upload file"}
        </button>
        {error && (
          <p className="error" id="import-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="sign-in-form">
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        maxLength={254}
        required
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        maxLength={256}
        required
      />
      {state?.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      <button className="primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
