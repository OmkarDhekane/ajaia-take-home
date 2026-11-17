"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { editorExtensions, maxTitleLength } from "@/lib/editor-schema";
import { saveDocumentDraft } from "../../actions";
import { ShareDialog, type SharingPerson } from "./share-dialog";

type Props = {
  id: string;
  initialTitle: string;
  initialContent: string;
  sharingPeople: SharingPerson[];
};

export function DocumentEditor({
  id,
  initialTitle,
  initialContent,
  sharingPeople,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState({
    title: initialTitle,
    content: initialContent,
  });
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<number | null>(null);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const dirty = title !== saved.title || content !== saved.content;
  const editor = useEditor({
    extensions: editorExtensions,
    content: JSON.parse(initialContent),
    immediatelyRender: false,
    onUpdate: ({ editor }) => setContent(JSON.stringify(editor.getJSON())),
    editorProps: {
      attributes: {
        class: "rich-text",
        role: "textbox",
        "aria-label": "Document body",
        "aria-multiline": "true",
        spellcheck: "true",
      },
    },
  });

  const formatting = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold"),
      italic: editor?.isActive("italic"),
      underline: editor?.isActive("underline"),
      bulletList: editor?.isActive("bulletList"),
      orderedList: editor?.isActive("orderedList"),
      heading: editor?.isActive("heading")
        ? Number(editor.getAttributes("heading").level)
        : 0,
    }),
  });

  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = true;
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (saveNotice === null) return;
    const timer = window.setTimeout(() => setSaveNotice(null), 1500);
    return () => window.clearTimeout(timer);
  }, [saveNotice]);

  async function save() {
    if (!editor || !dirty || inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setSaveNotice(null);
    setError("");
    const submitted = JSON.stringify(editor.getJSON());
    try {
      const result = await saveDocumentDraft(id, title, submitted);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved({ title: result.title, content: submitted });
      setTitle((current) => (current === title ? result.title : current));
      setSaveNotice(Date.now());
    } catch {
      setError("Could not save your changes. Please try again.");
    } finally {
      setSaving(false);
      inFlight.current = false;
    }
  }

  const commands = [
    {
      label: "Bold",
      symbol: "B",
      active: formatting?.bold,
      run: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      symbol: "I",
      active: formatting?.italic,
      run: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      symbol: "U",
      active: formatting?.underline,
      run: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Bulleted list",
      symbol: "• List",
      active: formatting?.bulletList,
      run: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      symbol: "1. List",
      active: formatting?.orderedList,
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div
      className="editor-shell"
      onKeyDown={(event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "s"
        ) {
          event.preventDefault();
          void save();
        }
      }}
    >
      <header className="topbar editor-header">
        <button
          className="secondary back"
          type="button"
          onClick={() => {
            if (!dirty || window.confirm("Leave without saving your changes?"))
              router.push("/");
          }}
        >
          <span aria-hidden="true">←</span> Documents
        </button>
        <div className="save-controls">
          <span
            className={dirty && !saving ? "status dirty" : "status"}
            role="status"
          >
            {saving
              ? "Saving…"
              : error
                ? "Save failed"
                : dirty
                  ? "Unsaved changes"
                  : "Saved"}
          </span>
          <ShareDialog documentId={id} people={sharingPeople} />
          <button
            className="primary"
            type="button"
            disabled={saving || !dirty || !editor}
            onClick={() => void save()}
          >
            Save
          </button>
        </div>
      </header>
      <main className="editing-area">
        <div className="save-announcement" role="status" aria-atomic="true">
          {saveNotice !== null && (
            <p className="save-toast">Saved successfully</p>
          )}
        </div>
        {error && (
          <p role="alert" className="error save-error">
            {error}
          </p>
        )}
        <div className="sheet">
          <label htmlFor="title" className="sr-only">
            Document title
          </label>
          <input
            id="title"
            className="title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled document"
            maxLength={maxTitleLength}
          />
          <div className="format-bar" role="group" aria-label="Text formatting">
            <select
              aria-label="Text style"
              value={formatting?.heading ?? 0}
              disabled={!editor}
              onChange={(event) => {
                const level = Number(event.target.value);
                if (level === 1 || level === 2 || level === 3) {
                  editor?.chain().focus().setHeading({ level }).run();
                } else {
                  editor?.chain().focus().setParagraph().run();
                }
              }}
            >
              <option value={0}>Normal text</option>
              <option value={1}>Heading 1</option>
              <option value={2}>Heading 2</option>
              <option value={3}>Heading 3</option>
            </select>
            {commands.map(({ label, symbol, active, run }) => (
              <button
                key={label}
                type="button"
                className="format-button"
                aria-label={label}
                aria-pressed={Boolean(active)}
                title={label}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={run}
              >
                <span aria-hidden="true">{symbol}</span>
              </button>
            ))}
          </div>
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}
