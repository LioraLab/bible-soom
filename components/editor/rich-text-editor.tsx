"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect } from "react";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "내용을 입력하세요...",
  maxLength = 8000,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-3 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100",
      },
    },
  });

  // content prop이 변경되면 에디터 업데이트
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* 툴바 */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        {/* 제목 버튼 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          H3
        </button>

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />

        {/* 텍스트 스타일 버튼 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 text-sm font-bold rounded transition-colors ${
            editor.isActive("bold")
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 text-sm italic rounded transition-colors ${
            editor.isActive("italic")
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 text-sm line-through rounded transition-colors ${
            editor.isActive("strike")
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          S
        </button>

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />

        {/* 리스트 버튼 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("bulletList")
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          • 목록
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("orderedList")
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          1. 목록
        </button>

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />

        {/* 인용 버튼 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("blockquote")
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
          }`}
        >
          " 인용
        </button>
      </div>

      {/* 에디터 */}
      <EditorContent editor={editor} />

      {/* 글자 수 카운터 */}
      <div className="flex justify-end text-xs text-slate-500 dark:text-slate-400 mt-1">
        <span
          className={
            editor.storage.characterCount.characters() === maxLength
              ? "text-red-600 dark:text-red-400 font-bold"
              : editor.storage.characterCount.characters() > maxLength * 0.9
              ? "text-amber-600 dark:text-amber-400 font-medium"
              : ""
          }
        >
          {editor.storage.characterCount.characters()} / {maxLength}
        </span>
      </div>
    </div>
  );
}
