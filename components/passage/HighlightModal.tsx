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
      className="bg-white/95 dark:bg-primary-950/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-stone-200 dark:border-primary-800 py-2.5 min-w-[180px] animate-in fade-in zoom-in duration-200"
    >
      <div className="px-3 py-1 mb-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-primary-500">Verse Options</p>
      </div>

      {isHighlighted ? (
        // 하이라이트 해제 버튼
        <button
          onClick={() => onRemoveHighlight(contextMenu.verse)}
          className="w-[calc(100%-1rem)] mx-2 px-3 py-2 text-left text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3 rounded-xl transition-colors"
        >
          <span className="text-lg">×</span>
          하이라이트 해제
        </button>
      ) : (
        // 하이라이트 추가 (색상 선택)
        <div className="space-y-1">
          <button
            onClick={onToggleColorPicker}
            className={`w-[calc(100%-1rem)] mx-2 px-3 py-2 text-left text-sm font-bold flex items-center justify-between gap-3 rounded-xl transition-all ${
              contextMenu.showColorPicker 
              ? "bg-paper-100 dark:bg-primary-900/50 text-paper-700 dark:text-paper-300" 
              : "text-stone-700 dark:text-primary-200 hover:bg-stone-50 dark:hover:bg-primary-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg text-paper-500">✨</span>
              하이라이트
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 transition-transform ${contextMenu.showColorPicker ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* 색상 선택 팔레트 */}
          {contextMenu.showColorPicker && (
            <div className="px-3 py-2 grid grid-cols-5 gap-2 animate-in slide-in-from-top-1 duration-200">
              {HIGHLIGHT_COLORS.map((item) => (
                <button
                  key={item.color}
                  onClick={() => onAddHighlight(contextMenu.verse, item.color)}
                  className={`w-full aspect-square rounded-full border-2 border-white dark:border-primary-950 shadow-sm hover:scale-110 transition-transform ${item.class}`}
                  title={item.name}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 구분선 */}
      <div className="h-px bg-stone-100 dark:bg-primary-800 my-1.5 mx-3"></div>

      {/* 메모 버튼 */}
      <button
        onClick={() => onOpenNote(contextMenu.verse)}
        className="w-[calc(100%-1rem)] mx-2 px-3 py-2 text-left text-sm font-bold hover:bg-stone-50 dark:hover:bg-primary-900 text-stone-700 dark:text-primary-200 flex items-center gap-3 rounded-xl transition-colors group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4 text-stone-400 group-hover:text-paper-500 transition-colors"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
        {hasNote ? "메모 보기" : "메모 작성"}
      </button>
    </div>
  );
}
