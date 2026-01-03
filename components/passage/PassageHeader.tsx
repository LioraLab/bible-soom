"use client";

import { useRef, useEffect, useState } from "react";
import { TRANSLATIONS, BOOK_CHAPTERS } from "@/lib/constants";

// 책 정보 타입
export interface BookInfo {
  id: number;
  name: string;
  testament: string;
  chapters: number;
}

// Props 타입 정의
export interface PassageHeaderProps {
  book: string;
  chapter: number;
  translation: string;
  isParallelView: boolean;
  secondTranslation: string;
  availableBooks: BookInfo[];
  fontSize: number;
  fontWeight: "normal" | "bold";
  isChapterBookmarked: boolean;
  onTranslationChange: (newTranslation: string) => void;
  onSecondTranslationChange: (newTranslation: string, isParallel: boolean) => void;
  onParallelViewClose: () => void;
  onFontSizeChange: (size: number) => void;
  onFontWeightChange: (weight: "normal" | "bold") => void;
  onChapterBookmarkToggle: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onBookChapterSelect: (book: string, chapter: number) => void;
}

export default function PassageHeader({
  book,
  chapter,
  translation,
  isParallelView,
  secondTranslation,
  availableBooks,
  fontSize,
  fontWeight,
  isChapterBookmarked,
  onTranslationChange,
  onSecondTranslationChange,
  onParallelViewClose,
  onFontSizeChange,
  onFontWeightChange,
  onChapterBookmarkToggle,
  onNavigatePrevious,
  onNavigateNext,
  onBookChapterSelect,
}: PassageHeaderProps) {
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [selectedBookForNav, setSelectedBookForNav] = useState(book);

  const bookSelectorRef = useRef<HTMLDivElement>(null);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);

  // 책 변경 시 선택된 책 업데이트
  useEffect(() => {
    setSelectedBookForNav(book);
  }, [book]);

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

  // 최대 장 수 계산
  const currentBook = availableBooks.find(b => b.name === book);
  const maxChapter = currentBook?.chapters || BOOK_CHAPTERS[book] || 0;
  const hasNextChapter = chapter < maxChapter;

  // 책/장 선택 핸들러
  function handleBookChapterSelectInternal(selectedBook: string, selectedChapter: number) {
    onBookChapterSelect(selectedBook, selectedChapter);
    setShowBookSelector(false);
  }

  return (
    <>
      {/* 이전 장 버튼 */}
      {chapter > 1 && (
        <button
          onClick={onNavigatePrevious}
          className="fixed left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center z-10"
          aria-label="이전 장"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-slate-600 dark:text-slate-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* 다음 장 버튼 */}
      {hasNextChapter && (
        <button
          onClick={onNavigateNext}
          className="fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center z-10"
          aria-label="다음 장"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-slate-600 dark:text-slate-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* 상단 네비게이션 박스 */}
      <div className="sticky top-4 z-30 flex flex-wrap items-center gap-3 mb-10 px-6 py-4 border border-stone-200/60 dark:border-primary-800/60 rounded-2xl bg-paper-50/90 dark:bg-primary-950/90 backdrop-blur-md shadow-sm transition-colors duration-500">
        {/* 책/장 선택 드롭다운 */}
        <div className="relative" ref={bookSelectorRef}>
          <button
            onClick={() => setShowBookSelector(!showBookSelector)}
            className="px-5 py-2.5 pr-10 bg-white dark:bg-primary-900/50 rounded-xl border border-stone-200 dark:border-primary-800 text-primary-900 dark:text-primary-100 hover:bg-paper-50 dark:hover:bg-primary-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all min-w-[150px] relative shadow-sm"
          >
            <span className="font-bold">{book} {chapter}장</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* 책/장 선택 드롭다운 메뉴 */}
          {showBookSelector && (
            <div className="absolute top-full left-0 mt-3 bg-white dark:bg-primary-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-primary-800 z-50 w-[420px] max-h-[450px] overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="grid grid-cols-2 h-full">
                {/* 왼쪽: 성경 목록 */}
                <div className="border-r border-stone-100 dark:border-primary-800">
                  <div className="bg-paper-50 dark:bg-primary-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-stone-500 dark:text-primary-400 border-b border-stone-100 dark:border-primary-800">
                    성경 목록
                  </div>
                  <div className="overflow-y-auto max-h-[380px] p-1">
                    {availableBooks.map((bookItem) => (
                      <button
                        key={bookItem.id}
                        onClick={() => setSelectedBookForNav(bookItem.name)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                          selectedBookForNav === bookItem.name
                            ? "bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-primary-200 font-bold"
                            : "text-stone-600 dark:text-primary-300 hover:bg-stone-50 dark:hover:bg-primary-800"
                        }`}
                      >
                        {bookItem.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 오른쪽: 장 */}
                <div className="bg-paper-50/30 dark:bg-primary-900/30">
                  <div className="bg-paper-50 dark:bg-primary-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-stone-500 dark:text-primary-400 border-b border-stone-100 dark:border-primary-800">
                    장 선택
                  </div>
                  <div className="overflow-y-auto max-h-[380px] p-2">
                    <div className="grid grid-cols-3 gap-1">
                      {(() => {
                        const selectedBook = availableBooks.find(b => b.name === selectedBookForNav);
                        const chapterCount = selectedBook?.chapters || BOOK_CHAPTERS[selectedBookForNav] || 0;

                        return Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapterNum) => (
                          <button
                            key={chapterNum}
                            onClick={() => handleBookChapterSelectInternal(selectedBookForNav, chapterNum)}
                            className={`flex items-center justify-center h-10 rounded-lg text-sm transition-colors ${
                              selectedBookForNav === book && chapterNum === chapter
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

        {/* 구분선 */}
        <div className="h-6 w-px bg-stone-200 dark:bg-primary-800 mx-1"></div>

        {/* 첫 번째 번역본 선택 */}
        <div className="relative">
          <select
            value={translation}
            onChange={(e) => onTranslationChange(e.target.value)}
            className="px-4 py-2.5 pr-10 bg-white dark:bg-primary-900 rounded-xl border border-stone-200 dark:border-primary-800 text-primary-900 dark:text-primary-100 outline-none cursor-pointer appearance-none hover:border-primary-300 dark:hover:border-primary-700 transition-all shadow-sm font-medium"
          >
            {TRANSLATIONS.map((t) => (
              <option key={t.code} value={t.code} disabled={!t.available}>
                {t.name} {!t.available ? '(준비중)' : ''}
              </option>
            ))}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {/* 두 번째 번역본 선택 (병렬 보기용) */}
        <div className="relative">
          <select
            value={isParallelView ? secondTranslation : ""}
            onChange={(e) => {
              if (e.target.value) {
                onSecondTranslationChange(e.target.value, true);
              } else {
                onSecondTranslationChange(secondTranslation, false);
              }
            }}
            className="px-4 py-2.5 pr-10 bg-white dark:bg-primary-900 rounded-xl border border-stone-200 dark:border-primary-800 text-primary-900 dark:text-primary-100 outline-none cursor-pointer appearance-none hover:border-primary-300 dark:hover:border-primary-700 transition-all shadow-sm font-medium"
          >
            <option value="">병렬 보기</option>
            {TRANSLATIONS.filter(t => t.code !== translation).map((t) => (
              <option key={t.code} value={t.code} disabled={!t.available}>
                {t.name} {!t.available ? '(준비중)' : ''}
              </option>
            ))}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {/* 병렬 보기 해제 버튼 */}
        {isParallelView && (
          <button
            onClick={onParallelViewClose}
            className="px-3 py-2 bg-stone-100 dark:bg-primary-800 rounded-lg text-stone-600 dark:text-primary-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all text-xs font-bold"
          >
            해제
          </button>
        )}

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
    </>
  );
}
