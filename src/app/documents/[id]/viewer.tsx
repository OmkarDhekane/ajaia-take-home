"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtensions } from "@/lib/editor-schema";

export function DocumentViewer({ contentJson }: { contentJson: string }) {
  const editor = useEditor(
    {
      extensions: editorExtensions,
      content: JSON.parse(contentJson),
      immediatelyRender: false,
      editable: false,
      editorProps: { attributes: { class: "rich-text", role: "document" } },
    },
    [contentJson],
  );
  return <EditorContent editor={editor} />;
}
