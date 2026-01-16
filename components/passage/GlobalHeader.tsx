"use client";

import { useState, useEffect, useRef } from "react";

// Props 타입 정의
export interface GlobalHeaderProps {
  fontSize: number;
  fontWeight: "normal" | "bold";
  isChapterBookmarked: boolean;
  currentPanelCount: number;
  onFontSizeChange: (size: number) => void;
  onFontWeightChange: (weight: "normal" | "bold") => void;
  onChapterBookmarkToggle: () => void;
  onAddPanel: () => void;
}

export default function GlobalHeader({
  fontSize,
  fontWeight,
  isChapterBookmarked,
  currentPanelCount,
  onFontSizeChange,
  onFontWeightChange,
  onChapterBookmarkToggle,
  onAddPanel,
}: GlobalHeaderProps) {
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);

  // 글자 크기 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontSizeMenuRef.current && !fontSizeMenuRef.current.contains(event.target as Node)) {
        setShowFontSizeMenu(false);
      }
    }

    if (showFontSizeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFontSizeMenu]);

  return (
    <div className="sticky top-4 z-30 flex flex-wrap items-center gap-3 mb-10 px-6 py-4 border border-stone-200/60 dark:border-primary-800/60 rounded-2xl bg-paper-50/90 dark:bg-primary-950/90 backdrop-blur-md shadow-sm">
      {/* 패널 추가 버튼 */}
      <button
        onClick={onAddPanel}
        disabled={currentPanelCount >= 3}
        className={`px-4 h-11 rounded-xl border transition-all flex items-center gap-2 shadow-sm ${
          currentPanelCount >= 3
            ? "bg-stone-100 dark:bg-primary-800/50 border-stone-200 dark:border-primary-800 text-stone-400 dark:text-primary-600 cursor-not-allowed"
            : "bg-primary-600 border-primary-600 hover:bg-primary-700 hover:border-primary-700 text-white shadow-lg shadow-primary-500/20"
        }`}
        title={currentPanelCount >= 3 ? "최대 3개 패널" : "병렬 보기 추가"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span className="text-sm font-bold">병렬 보기 추가</span>
        <span className="text-xs opacity-70">({currentPanelCount}/3)</span>
      </button>

      <div className="flex-1"></div>

      {/* 글자 크기 설정 버튼 */}
      <div className="relative" ref={fontSizeMenuRef}>
        <button
          onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
          className={`w-11 h-11 rounded-xl border transition-all flex items-center justify-center relative shadow-sm ${
            showFontSizeMenu
              ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20"
              : "bg-white dark:bg-primary-900 border-stone-200 dark:border-primary-800 text-stone-600 dark:text-primary-200 hover:border-primary-300 dark:hover:border-primary-700"
          }`}
        >
          <span className="text-xs translate-y-0.5 font-bold">가</span>
          <span className="text-lg font-black -translate-y-0.5">가</span>
        </button>

        {/* 글자 크기 설정 메뉴 */}
        {showFontSizeMenu && (
          <div className="absolute top-full right-0 mt-3 bg-white dark:bg-primary-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-primary-800 z-50 w-[320px] p-6 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* 글자 크기 */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 dark:text-primary-500 mb-4">글자 크기</h3>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((size) => (
                  <button
                    key={size}
                    onClick={() => onFontSizeChange(size)}
                    className={`h-10 rounded-lg transition-all flex items-center justify-center ${
                      fontSize === size
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                        : "bg-stone-50 dark:bg-primary-800 text-stone-600 dark:text-primary-200 hover:bg-stone-100 dark:hover:bg-primary-700"
                    }`}
                  >
                    <span style={{ fontSize: `${12 + size * 1}px` }} className="font-bold">가</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 글자 굵기 */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 dark:text-primary-500 mb-4">글자 굵기</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onFontWeightChange("normal")}
                  className={`py-2.5 rounded-lg text-sm transition-all font-medium ${
                    fontWeight === "normal"
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                      : "bg-stone-50 dark:bg-primary-800 text-stone-600 dark:text-primary-200 hover:bg-stone-100 dark:hover:bg-primary-700"
                  }`}
                >
                  보통
                </button>
                <button
                  onClick={() => onFontWeightChange("bold")}
                  className={`py-2.5 rounded-lg text-sm transition-all font-bold ${
                    fontWeight === "bold"
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                      : "bg-stone-50 dark:bg-primary-800 text-stone-600 dark:text-primary-200 hover:bg-stone-100 dark:hover:bg-primary-700"
                  }`}
                >
                  굵게
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 책갈피 버튼 */}
      <button
        onClick={onChapterBookmarkToggle}
        className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
          isChapterBookmarked
            ? "bg-paper-500 border-paper-500 hover:bg-paper-600 hover:border-paper-600 shadow-lg shadow-paper-500/30 text-white"
            : "border-stone-200 dark:border-primary-800 bg-white dark:bg-primary-900 text-stone-400 hover:border-paper-400 hover:text-paper-500"
        }`}
        title={isChapterBookmarked ? "책갈피 해제" : "책갈피 추가"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isChapterBookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2.5}
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </button>
    </div>
  );
}
