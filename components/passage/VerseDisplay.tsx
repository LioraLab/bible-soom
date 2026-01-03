"use client";

import { FONT_SIZE_CLASSES, HIGHLIGHT_BG_CLASSES } from "@/lib/constants";

// Verse 타입 정의
export interface Verse {
  id: number;
  text: string;
  book: string;
  chapter: number;
  verse: number;
}

// Props 타입 정의
export interface VerseDisplayProps {
  verse: Verse;
  highlightColor?: string;
  hasNote: boolean;
  fontSize: number;
  fontWeight: "normal" | "bold";
  onVerseClick: (event: React.MouseEvent, verse: Verse) => void;
  onNoteClick: (event: React.MouseEvent, verse: Verse) => void;
  isInteractive?: boolean;
}

// 글자 크기 클래스 반환
function getFontSizeClass(size: number): string {
  return FONT_SIZE_CLASSES[size] || "text-lg";
}

// 하이라이트 배경색 클래스 반환
function getBackgroundColorClass(color: string): string {
  return HIGHLIGHT_BG_CLASSES[color] || "bg-yellow-200 dark:bg-yellow-500/30";
}

export default function VerseDisplay({
  verse,
  highlightColor,
  hasNote,
  fontSize,
  fontWeight,
  onVerseClick,
  onNoteClick,
  isInteractive = true,
}: VerseDisplayProps) {
  const hasHighlight = !!highlightColor;

  return (
    <div
      onClick={isInteractive ? (e) => onVerseClick(e, verse) : undefined}
      className={`rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all ${
        isInteractive ? "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" : ""
      } relative`}
    >
      <div className="flex items-start gap-3">
        {/* 절 번호 */}
        <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm min-w-[2rem]">
          {verse.verse}
        </span>

        {/* 본문 */}
        <div
          className={`leading-relaxed flex-1 text-slate-800 dark:text-slate-200 ${getFontSizeClass(fontSize)} ${
            fontWeight === "bold" ? "font-bold" : "font-normal"
          }`}
        >
          <span
            className={
              hasHighlight
                ? `${getBackgroundColorClass(highlightColor!)} px-1 py-0.5 rounded`
                : ""
            }
          >
            {verse.text}
          </span>

          {/* 메모 아이콘 */}
          {hasNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNoteClick(e, verse);
              }}
              className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all align-middle"
              title="메모 보기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-slate-600 dark:text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
