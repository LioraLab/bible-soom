"use client";

import { useRef, useEffect } from "react";
import { HIGHLIGHT_COLORS } from "@/lib/constants";
import type { Verse } from "./VerseDisplay";

// 컨텍스트 메뉴 타입
export interface ContextMenu {
  verse: Verse;
  x: number;
  y: number;
  showColorPicker?: boolean;
}

// Props 타입 정의
export interface HighlightModalProps {
  contextMenu: ContextMenu | null;
  isHighlighted: boolean;
  hasNote: boolean;
  onClose: () => void;
  onAddHighlight: (verse: Verse, color: string) => void;
  onRemoveHighlight: (verse: Verse) => void;
  onToggleColorPicker: () => void;
  onOpenNote: (verse: Verse) => void;
}

export default function HighlightModal({
  contextMenu,
  isHighlighted,
  hasNote,
  onClose,
  onAddHighlight,
  onRemoveHighlight,
  onToggleColorPicker,
  onOpenNote,
}: HighlightModalProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 컨텍스트 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [contextMenu, onClose]);

  if (!contextMenu) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: contextMenu.y,
        left: contextMenu.x,
        zIndex: 1000,
      }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[160px]"
    >
      {isHighlighted ? (
        // 하이라이트 해제 버튼
        <button
          onClick={() => onRemoveHighlight(contextMenu.verse)}
          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
        >
          <span className="text-amber-500">*</span>
          하이라이트 해제
        </button>
      ) : (
        // 하이라이트 추가 (색상 선택)
        <>
          <button
            onClick={onToggleColorPicker}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-amber-500">*</span>
              하이라이트
            </div>
            <span className="text-xs">{contextMenu.showColorPicker ? "^" : "v"}</span>
          </button>

          {/* 색상 선택 팔레트 */}
          {contextMenu.showColorPicker && (
            <div className="px-2 py-2 space-y-1">
              {HIGHLIGHT_COLORS.map((item) => (
                <button
                  key={item.color}
                  onClick={() => onAddHighlight(contextMenu.verse, item.color)}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 rounded"
                >
                  <span className={`w-4 h-4 rounded ${item.class}`}></span>
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* 메모 버튼 */}
      <button
        onClick={() => onOpenNote(contextMenu.verse)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
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
        {hasNote ? "메모 보기" : "메모 작성"}
      </button>
    </div>
  );
}
