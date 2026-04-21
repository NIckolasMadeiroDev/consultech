"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";

export type RichTextBlockEditorProps = {
  readonly html: string;
  readonly onChange: (html: string) => void;
  readonly disabled?: boolean;
  readonly "aria-labelledby"?: string;
};

export function RichTextBlockEditor({
  html,
  onChange,
  disabled,
  "aria-labelledby": ariaLabelledBy,
}: RichTextBlockEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
    ],
    content: html?.trim() ? html : "<p></p>",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-neutral-600",
        ...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = html?.trim() ? html : "<p></p>";
    const cur = editor.getHTML();
    if (next !== cur) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [html, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div className="min-h-[120px] rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/40" />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className="rounded border border-neutral-300 px-2 py-1 text-small dark:border-neutral-600"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
        >
          Negrito
        </button>
        <button
          type="button"
          className="rounded border border-neutral-300 px-2 py-1 text-small dark:border-neutral-600"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
        >
          Itálico
        </button>
        <button
          type="button"
          className="rounded border border-neutral-300 px-2 py-1 text-small dark:border-neutral-600"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
        >
          Lista
        </button>
        <button
          type="button"
          className="rounded border border-neutral-300 px-2 py-1 text-small dark:border-neutral-600"
          onClick={() => {
            const url = globalThis.prompt("URL do link");
            if (url?.trim()) {
              editor.chain().focus().setLink({ href: url.trim() }).run();
            }
          }}
          disabled={disabled}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
