import StarterKit from "@tiptap/starter-kit";

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    strike: false,
  }),
];

export const emptyDocument = { type: "doc", content: [{ type: "paragraph" }] };
export const maxTitleLength = 120;
