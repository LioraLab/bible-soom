"use client";

import { PanelConfig } from "./passage-client";
import { BookInfo } from "./PassageHeader";
import PanelHeader from "./PanelHeader";
import VerseDisplay, { Verse } from "./VerseDisplay";
import { TRANSLATIONS } from "@/lib/constants";
import { getChapterSuffix } from "@/lib/books";

// Props 타입 정의
export interface BiblePanelProps {
  panel: PanelConfig;
  availableBooks: BookInfo[];
  fontSize: number;
  fontWeight: "normal" | "bold";
  highlightedVerseIds: Map<number, string>;
  notedVerseIds: Set<number>;
  onVerseClick: (event: React.MouseEvent, verse: Verse) => void;
  onNoteClick: (event: React.MouseEvent, verse: Verse) => void;
  onTranslationChange: (panelId: string, translation: string) => void;
  onNavigatePrevious: (panelId: string) => void;
  onNavigateNext: (panelId: string) => void;
  onBookChapterSelect: (panelId: string, bookAbbrEng: string, chapter: number) => void;
  onClose?: (panelId: string) => void;
}

export default function BiblePanel({
  panel,
  availableBooks,
  fontSize,
  fontWeight,
  highlightedVerseIds,
  notedVerseIds,
  onVerseClick,
  onNoteClick,
  onTranslationChange,
  onNavigatePrevious,
  onNavigateNext,
  onBookChapterSelect,
  onClose,
}: BiblePanelProps) {
  // Panel-1인지 확인
  const isInteractive = panel.id === 'panel-1';
  const showCloseButton = panel.id !== 'panel-1';

  return (
    <div className="space-y-4">
      {/* 패널 헤더 */}
      <PanelHeader
        panelId={panel.id}
        bookAbbrEng={panel.bookAbbrEng}
        bookName={panel.bookName}
        chapter={panel.chapter}
        translation={panel.translation}
        availableBooks={availableBooks}
        showCloseButton={showCloseButton}
        onTranslationChange={(translation) => onTranslationChange(panel.id, translation)}
        onNavigatePrevious={() => onNavigatePrevious(panel.id)}
        onNavigateNext={() => onNavigateNext(panel.id)}
        onBookChapterSelect={(bookAbbrEng, chapter) => onBookChapterSelect(panel.id, bookAbbrEng, chapter)}
        onClose={onClose ? () => onClose(panel.id) : undefined}
      />

      {/* 패널 제목 */}
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        {panel.bookName} {panel.chapter}{getChapterSuffix(panel.translation)}
        <span className="text-lg text-stone-500 dark:text-primary-400 ml-2">
          [{TRANSLATIONS.find(t => t.code === panel.translation)?.name}]
        </span>
      </h2>

      {/* 로딩 상태 */}
      {panel.isLoading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-stone-500 dark:text-primary-400 font-medium">로딩 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {panel.error && !panel.isLoading && (
        <div className="text-center py-16 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 font-bold">오류가 발생했습니다</p>
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">{panel.error}</p>
        </div>
      )}

      {/* 빈 구절 상태 */}
      {!panel.isLoading && !panel.error && panel.verses.length === 0 && (
        <div className="text-center py-16 text-stone-500 dark:text-primary-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto mb-3 opacity-50"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="font-medium">구절을 찾을 수 없습니다.</p>
        </div>
      )}

      {/* 구절 목록 */}
      {!panel.isLoading && !panel.error && panel.verses.length > 0 && (
        <div className="space-y-3">
          {panel.verses.map((verse) => (
            <VerseDisplay
              key={verse.id}
              verse={verse}
              highlightColor={isInteractive ? highlightedVerseIds.get(verse.id) : undefined}
              hasNote={isInteractive ? notedVerseIds.has(verse.id) : false}
              fontSize={fontSize}
              fontWeight={fontWeight}
              onVerseClick={isInteractive ? onVerseClick : () => {}}
              onNoteClick={isInteractive ? onNoteClick : () => {}}
              isInteractive={isInteractive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
