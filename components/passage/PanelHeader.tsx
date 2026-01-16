"use client";

import { useRef, useEffect, useState } from "react";
import { TRANSLATIONS, BOOK_CHAPTERS } from "@/lib/constants";
import { BookInfo } from "./PassageHeader";
import { getChapterSuffix, getBookNameByTranslation, type BookWithNames } from "@/lib/books";

// Props 타입 정의
export interface PanelHeaderProps {
  panelId: string;
  bookAbbrEng: string;
  bookName: string;
  chapter: number;
  translation: string;
  availableBooks: BookInfo[];
  showCloseButton: boolean;
  onTranslationChange: (translation: string) => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onBookChapterSelect: (bookAbbrEng: string, chapter: number) => void;
  onClose?: () => void;
}

export default function PanelHeader({
  panelId,
  bookAbbrEng,
  bookName,
  chapter,
  translation,
  availableBooks,
  showCloseButton,
  onTranslationChange,
  onNavigatePrevious,
  onNavigateNext,
  onBookChapterSelect,
  onClose,
}: PanelHeaderProps) {
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [selectedBookAbbrForNav, setSelectedBookAbbrForNav] = useState(bookAbbrEng);

  const bookSelectorRef = useRef<HTMLDivElement>(null);

  // 책 변경 시 선택된 책 업데이트
  useEffect(() => {
    setSelectedBookAbbrForNav(bookAbbrEng);
  }, [bookAbbrEng]);

  // 책 선택 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bookSelectorRef.current && !bookSelectorRef.current.contains(event.target as Node)) {
        setShowBookSelector(false);
      }
    }

    if (showBookSelector) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showBookSelector]);

  // 최대 장 수 계산
  const currentBook = availableBooks.find((b: any) => b.abbr_eng === bookAbbrEng);
  const maxChapter = currentBook?.chapters || 0;
  const hasNextChapter = chapter < maxChapter;

  // 책/장 선택 핸들러
  function handleBookChapterSelectInternal(selectedBookAbbr: string, selectedChapter: number) {
    onBookChapterSelect(selectedBookAbbr, selectedChapter);
    setShowBookSelector(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-stone-200 dark:border-primary-800">
      {/* 닫기 버튼 (패널 2-3만) */}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg border border-stone-200 dark:border-primary-800 bg-white dark:bg-primary-900 text-stone-400 dark:text-primary-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center"
          title="패널 닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* 이전 장 버튼 */}
      <button
        onClick={onNavigatePrevious}
        disabled={chapter <= 1}
        className={`w-9 h-9 rounded-lg border transition-all flex items-center justify-center ${
          chapter <= 1
            ? "border-stone-200 dark:border-primary-800 bg-stone-100 dark:bg-primary-900/50 text-stone-300 dark:text-primary-700 cursor-not-allowed"
            : "border-stone-200 dark:border-primary-800 bg-white dark:bg-primary-900 text-stone-600 dark:text-primary-200 hover:bg-primary-50 dark:hover:bg-primary-800 hover:border-primary-300 dark:hover:border-primary-700"
        }`}
        title="이전 장"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* 책/장 선택 드롭다운 */}
      <div className="relative flex-1 min-w-[140px]" ref={bookSelectorRef}>
        <button
          onClick={() => setShowBookSelector(!showBookSelector)}
          className="w-full px-4 py-2 pr-9 bg-white dark:bg-primary-900/50 rounded-lg border border-stone-200 dark:border-primary-800 text-primary-900 dark:text-primary-100 hover:bg-paper-50 dark:hover:bg-primary-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all relative text-left"
        >
          <span className="font-bold text-sm">{bookName} {chapter}{getChapterSuffix(translation)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* 책/장 선택 드롭다운 메뉴 */}
        {showBookSelector && (
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-primary-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-primary-800 z-50 w-[420px] max-h-[450px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="grid grid-cols-2 h-full">
              {/* 왼쪽: 성경 목록 */}
              <div className="border-r border-stone-100 dark:border-primary-800">
                <div className="bg-paper-50 dark:bg-primary-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-stone-500 dark:text-primary-400 border-b border-stone-100 dark:border-primary-800">
                  성경 목록
                </div>
                <div className="overflow-y-auto max-h-[380px] p-1">
                  {availableBooks.map((bookItem: any) => {
                    // bookItem.name is already translated to the correct language
                    const displayName = bookItem.name;
                    return (
                      <button
                        key={bookItem.id}
                        onClick={() => setSelectedBookAbbrForNav(bookItem.abbr_eng)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                          selectedBookAbbrForNav === bookItem.abbr_eng
                            ? "bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-primary-200 font-bold"
                            : "text-stone-600 dark:text-primary-300 hover:bg-stone-50 dark:hover:bg-primary-800"
                        }`}
                      >
                        {displayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 오른쪽: 장 */}
              <div className="bg-paper-50/30 dark:bg-primary-900/30">
                <div className="bg-paper-50 dark:bg-primary-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-stone-500 dark:text-primary-400 border-b border-stone-100 dark:border-primary-800">
                  {(() => {
                    const selectedBook = availableBooks.find((b: any) => b.abbr_eng === selectedBookAbbrForNav);
                    if (selectedBook) {
                      return selectedBook.name;
                    }
                    return "장 선택";
                  })()}
                </div>
                <div className="overflow-y-auto max-h-[380px] p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {(() => {
                      const selectedBook = availableBooks.find((b: any) => b.abbr_eng === selectedBookAbbrForNav);
                      const chapterCount = selectedBook?.chapters || 0;

                      return Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapterNum) => (
                        <button
                          key={chapterNum}
                          onClick={() => handleBookChapterSelectInternal(selectedBookAbbrForNav, chapterNum)}
                          className={`flex items-center justify-center h-10 rounded-lg text-sm transition-colors ${
                            selectedBookAbbrForNav === bookAbbrEng && chapterNum === chapter
                              ? "bg-primary-600 text-white font-bold shadow-md shadow-primary-500/20"
                              : "text-stone-600 dark:text-primary-300 hover:bg-white dark:hover:bg-primary-800 border border-transparent hover:border-stone-200 dark:hover:border-primary-700"
                          }`}
                        >
                          {chapterNum}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 다음 장 버튼 */}
      <button
        onClick={onNavigateNext}
        disabled={!hasNextChapter}
        className={`w-9 h-9 rounded-lg border transition-all flex items-center justify-center ${
          !hasNextChapter
            ? "border-stone-200 dark:border-primary-800 bg-stone-100 dark:bg-primary-900/50 text-stone-300 dark:text-primary-700 cursor-not-allowed"
            : "border-stone-200 dark:border-primary-800 bg-white dark:bg-primary-900 text-stone-600 dark:text-primary-200 hover:bg-primary-50 dark:hover:bg-primary-800 hover:border-primary-300 dark:hover:border-primary-700"
        }`}
        title="다음 장"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* 구분선 */}
      <div className="h-6 w-px bg-stone-200 dark:bg-primary-800"></div>

      {/* 번역본 선택 */}
      <div className="relative">
        <select
          value={translation}
          onChange={(e) => onTranslationChange(e.target.value)}
          className="px-3 py-2 pr-9 bg-white dark:bg-primary-900 rounded-lg border border-stone-200 dark:border-primary-800 text-primary-900 dark:text-primary-100 outline-none cursor-pointer appearance-none hover:border-primary-300 dark:hover:border-primary-700 transition-all text-sm font-medium"
        >
          {TRANSLATIONS.map((t) => (
            <option key={t.code} value={t.code} disabled={!t.available}>
              {t.name} {!t.available ? '(준비중)' : ''}
            </option>
          ))}
        </select>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}
