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
      className={`group rounded-xl border border-transparent p-4 transition-all duration-200 ${
        isInteractive 
          ? "hover:bg-white dark:hover:bg-primary-900/50 hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer hover:shadow-sm" 
          : ""
      } relative`}
    >
      <div className="flex items-start gap-4">
        {/* 절 번호 */}
        <span className="font-sans font-medium text-stone-400 dark:text-primary-500 text-sm min-w-[1.5rem] pt-1.5 transition-colors group-hover:text-primary-500">
          {verse.verse}
        </span>

        {/* 본문 */}
        <div
          className={`font-bible leading-relaxed flex-1 text-primary-900 dark:text-primary-50 ${getFontSizeClass(fontSize)} ${
            fontWeight === "bold" ? "font-bold" : "font-normal"
          }`}
        >
          <span
            className={
              hasHighlight
                ? `${getBackgroundColorClass(highlightColor!)} px-1 py-0.5 rounded-md transition-all shadow-sm`
                : "transition-all"
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
              className="ml-3 inline-flex items-center justify-center w-7 h-7 rounded-full border border-stone-200 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-paper-100 dark:hover:bg-primary-800 hover:border-paper-300 dark:hover:border-primary-700 transition-all align-middle shadow-sm text-paper-600 dark:text-paper-400"
              title="메모 보기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
