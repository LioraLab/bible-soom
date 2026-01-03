"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/editor/rich-text-editor";
import {
  TRANSLATIONS,
  BOOK_CHAPTERS,
  FONT_SIZE_CLASSES,
  HIGHLIGHT_BG_CLASSES,
  HIGHLIGHT_COLORS,
} from "@/lib/constants";

type Verse = {
  id: number;
  text: string;
  book: string;
  chapter: number;
  verse: number;
};

type ContextMenu = {
  verse: Verse;
  x: number;
  y: number;
  showColorPicker?: boolean;
} | null;

export default function PassageClient({
  translation,
  book,
  chapter,
  verses,
}: {
  translation: string;
  book: string;
  chapter: number;
  verses: Verse[];
}) {
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [noteModal, setNoteModal] = useState<Verse | null>(null);
  const [note, setNote] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [highlightedVerseIds, setHighlightedVerseIds] = useState<Map<number, string>>(new Map());
  const [bookmarkedVerseIds, setBookmarkedVerseIds] = useState<Set<number>>(new Set());
  const [notedVerseIds, setNotedVerseIds] = useState<Set<number>>(new Set());
  const [noteContents, setNoteContents] = useState<Map<number, { id: number; content: string }>>(new Map());
  const [isParallelView, setIsParallelView] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isParallelView') === 'true';
    }
    return false;
  });
  const [secondTranslation, setSecondTranslation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('secondTranslation') || 'NIV';
    }
    return 'NIV';
  });
  const [secondVerses, setSecondVerses] = useState<Verse[]>([]);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [availableBooks, setAvailableBooks] = useState<{ id: number; name: string; testament: string; chapters: number }[]>([]);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fontSize');
      return saved ? Number(saved) : 3;
    }
    return 3;
  }); // 1~5, 기본값 3 (중간)
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('fontWeight') as "normal" | "bold") || "normal";
    }
    return "normal";
  }); // 글자 굵기
  const [isChapterBookmarked, setIsChapterBookmarked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bookSelectorRef = useRef<HTMLDivElement>(null);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  // URL 디코딩
  const decodedBook = decodeURIComponent(book);
  const [selectedBookForNav, setSelectedBookForNav] = useState(decodedBook);

  // 책 목록 가져오기
  useEffect(() => {
    async function fetchBooks() {
      const res = await fetch('/api/v1/books');
      if (res.ok) {
        const data = await res.json();
        setAvailableBooks(data.books || []);
      }
    }
    fetchBooks();
  }, []);

  // 병렬 보기 상태를 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isParallelView', String(isParallelView));
      localStorage.setItem('secondTranslation', secondTranslation);
    }
  }, [isParallelView, secondTranslation]);

  // 글자 크기와 굵기를 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', String(fontSize));
      localStorage.setItem('fontWeight', fontWeight);
    }
  }, [fontSize, fontWeight]);

  // 현재 책/장의 북마크 상태 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('chapterBookmarks') || '[]');
      const key = `${decodedBook}-${chapter}`;
      setIsChapterBookmarked(bookmarks.includes(key));
    }
  }, [decodedBook, chapter]);

  // 병렬 보기용 두 번째 번역본 데이터 가져오기
  useEffect(() => {
    if (!isParallelView) return;

    async function fetchSecondTranslation() {
      const encodedBook = encodeURIComponent(decodedBook);
      const res = await fetch(`/api/v1/passages?translation=${secondTranslation}&book=${encodedBook}&chapter=${chapter}`);
      if (res.ok) {
        const data = await res.json();
        setSecondVerses(data.verses || []);
      }
    }

    fetchSecondTranslation();
  }, [isParallelView, secondTranslation, decodedBook, chapter]);

  // 하이라이트, 북마크, 메모 목록 가져오기
  useEffect(() => {
    if (!user) return; // 로그인하지 않으면 가져오지 않음

    async function fetchUserData() {
      try {
        // 하이라이트 가져오기
        const highlightsRes = await fetch("/api/v1/highlights");
        if (highlightsRes.ok) {
          const highlightsData = await highlightsRes.json();
          const highlightMap = new Map<number, string>();
          highlightsData.highlights?.forEach((h: any) => {
            highlightMap.set(h.verse_id, h.color || "yellow");
          });
          setHighlightedVerseIds(highlightMap);
        }

        // 북마크 가져오기
        const bookmarksRes = await fetch("/api/v1/bookmarks");
        if (bookmarksRes.ok) {
          const bookmarksData = await bookmarksRes.json();
          const ids = new Set(bookmarksData.bookmarks?.map((b: any) => b.verse_id) || []);
          setBookmarkedVerseIds(ids);
        }

        // 메모 가져오기
        const notesRes = await fetch("/api/v1/notes");
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          const ids = new Set(notesData.notes?.map((n: any) => n.verse_id) || []);
          setNotedVerseIds(ids);

          // 메모 내용과 ID를 Map에 저장
          const contents = new Map<number, { id: number; content: string }>();
          notesData.notes?.forEach((n: any) => {
            contents.set(n.verse_id, { id: n.id, content: n.content });
          });
          setNoteContents(contents);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }

    fetchUserData();
  }, [user]);

  // 컨텍스트 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    }

    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [contextMenu]);

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

  // 구절 클릭 핸들러
  function handleVerseClick(event: React.MouseEvent, verse: Verse) {
    event.preventDefault();

    // 로그인하지 않은 경우 로그인 페이지로 이동
    if (!user) {
      if (confirm("로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }

    setContextMenu({
      verse,
      x: event.clientX,
      y: event.clientY,
    });
  }

  async function addHighlight(v: Verse, color: string) {
    const res = await fetch("/api/v1/highlights", {
      method: "POST",
      body: JSON.stringify({ verseId: v.id, color }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setHighlightedVerseIds((prev) => {
        const next = new Map(prev);
        next.set(v.id, color);
        return next;
      });
      alert("하이라이트가 추가되었습니다!");
    }
    setContextMenu(null);
  }

  async function removeHighlight(v: Verse) {
    const res = await fetch("/api/v1/highlights", {
      method: "DELETE",
      body: JSON.stringify({ verseId: v.id }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setHighlightedVerseIds((prev) => {
        const next = new Map(prev);
        next.delete(v.id);
        return next;
      });
      alert("하이라이트가 해제되었습니다!");
    }
    setContextMenu(null);
  }

  function toggleColorPicker() {
    setContextMenu((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        showColorPicker: !prev.showColorPicker,
      };
    });
  }

  async function toggleBookmark(v: Verse) {
    const isBookmarked = bookmarkedVerseIds.has(v.id);

    if (isBookmarked) {
      // 북마크 삭제
      const res = await fetch("/api/v1/bookmarks", {
        method: "DELETE",
        body: JSON.stringify({ verseId: v.id }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setBookmarkedVerseIds((prev) => {
          const next = new Set(prev);
          next.delete(v.id);
          return next;
        });
        alert("북마크가 삭제되었습니다!");
      }
    } else {
      // 북마크 추가
      const res = await fetch("/api/v1/bookmarks", {
        method: "POST",
        body: JSON.stringify({ verseId: v.id }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setBookmarkedVerseIds((prev) => new Set(prev).add(v.id));
        alert("북마크가 추가되었습니다!");
      }
    }
    setContextMenu(null);
  }

  function openNoteModal(v: Verse) {
    // 기존 메모가 있으면 불러오기
    const existingNote = noteContents.get(v.id)?.content || "";
    setNote(existingNote);

    // 메모가 있으면 보기 모드, 없으면 편집 모드
    setIsEditMode(existingNote === "");
    setNoteModal(v);
    setContextMenu(null);
  }

  async function saveNote() {
    if (!noteModal) return;

    const existingNote = noteContents.get(noteModal.id);

    // 메모가 이미 있으면 PUT, 없으면 POST
    const res = existingNote
      ? await fetch(`/api/v1/notes/${existingNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: note }),
        })
      : await fetch("/api/v1/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verseId: noteModal.id,
            content: note,
          }),
        });

    if (res.ok) {
      const data = await res.json();
      setNotedVerseIds((prev) => new Set(prev).add(noteModal.id));
      // 메모 내용과 ID를 Map 업데이트
      setNoteContents((prev) => {
        const next = new Map(prev);
        next.set(noteModal.id, {
          id: existingNote ? existingNote.id : data.note.id,
          content: note
        });
        return next;
      });
      alert("메모가 저장되었습니다!");
      // 모달 닫기
      setNote("");
      setNoteModal(null);
      setIsEditMode(false);
    } else {
      const error = await res.json();
      alert(`메모 저장 실패: ${error.error || '알 수 없는 오류'}`);
    }
  }

  function closeNoteModal() {
    setNote("");
    setNoteModal(null);
    setIsEditMode(false);
  }

  function enterEditMode() {
    setIsEditMode(true);
  }

  async function deleteNote() {
    if (!noteModal) return;
    const noteData = noteContents.get(noteModal.id);
    if (!noteData) return;

    if (!confirm("메모를 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/v1/notes/${noteData.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setNotedVerseIds((prev) => {
        const next = new Set(prev);
        next.delete(noteModal.id);
        return next;
      });
      setNoteContents((prev) => {
        const next = new Map(prev);
        next.delete(noteModal.id);
        return next;
      });
      alert("메모가 삭제되었습니다!");
      closeNoteModal();
    }
  }

  const currentTranslation = TRANSLATIONS.find((t) => t.code === translation) || TRANSLATIONS[0];

  function handleTranslationChange(newTranslation: string) {
    const encodedBook = encodeURIComponent(decodedBook);
    router.push(`/bible/${newTranslation}/${encodedBook}/${chapter}`);
  }

  function goToPreviousChapter() {
    const encodedBook = encodeURIComponent(decodedBook);
    const prevChapter = chapter - 1;
    if (prevChapter >= 1) {
      router.push(`/bible/${translation}/${encodedBook}/${prevChapter}`);
    }
  }

  function goToNextChapter() {
    const encodedBook = encodeURIComponent(decodedBook);
    const nextChapter = chapter + 1;
    router.push(`/bible/${translation}/${encodedBook}/${nextChapter}`);
  }

  function handleBookChapterSelect(selectedBook: string, selectedChapter: number) {
    const encodedBook = encodeURIComponent(selectedBook);
    router.push(`/bible/${translation}/${encodedBook}/${selectedChapter}`);
    setShowBookSelector(false);
  }

  function toggleChapterBookmark() {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('chapterBookmarks') || '[]');
      const key = `${decodedBook}-${chapter}`;

      if (isChapterBookmarked) {
        // 북마크 해제
        const updated = bookmarks.filter((b: string) => b !== key);
        localStorage.setItem('chapterBookmarks', JSON.stringify(updated));
        setIsChapterBookmarked(false);
        alert('책갈피가 해제되었습니다!');
      } else {
        // 북마크 추가
        bookmarks.push(key);
        localStorage.setItem('chapterBookmarks', JSON.stringify(bookmarks));
        setIsChapterBookmarked(true);
        alert('책갈피가 추가되었습니다!');
      }
    }
  }

  // 글자 크기에 따른 클래스 매핑
  const getFontSizeClass = (size: number) => {
    return FONT_SIZE_CLASSES[size] || "text-lg";
  };

  // 하이라이트 배경색 클래스 매핑
  const getBackgroundColorClass = (color: string) => {
    return HIGHLIGHT_BG_CLASSES[color] || "bg-yellow-200 dark:bg-yellow-500/30";
  };

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 py-8 space-y-6 relative">
      {/* 이전 장 버튼 */}
      {chapter > 1 && (
        <button
          onClick={goToPreviousChapter}
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
      {(() => {
        const currentBook = availableBooks.find(b => b.name === decodedBook);
        const maxChapter = currentBook?.chapters || BOOK_CHAPTERS[decodedBook] || 0;
        const hasNextChapter = chapter < maxChapter;

        return hasNextChapter && (
          <button
            onClick={goToNextChapter}
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
        );
      })()}
      {/* 상단 네비게이션 박스 */}
      <div className="flex flex-wrap items-center gap-3 mb-6 px-40 py-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900">
        {/* 책/장 선택 드롭다운 */}
        <div className="relative" ref={bookSelectorRef}>
          <button
            onClick={() => setShowBookSelector(!showBookSelector)}
            className="px-4 py-2 pr-10 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all min-w-[140px] relative"
          >
            <span>{decodedBook} {chapter}장</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* 책/장 선택 드롭다운 메뉴 */}
          {showBookSelector && (
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 w-[400px] max-h-[400px] overflow-hidden">
              <div className="grid grid-cols-2">
                {/* 왼쪽: 성경 목록 */}
                <div className="border-r border-slate-200 dark:border-slate-700">
                  <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    성경 목록
                  </div>
                  <div className="overflow-y-auto max-h-[350px]">
                    {availableBooks.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => setSelectedBookForNav(book.name)}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedBookForNav === book.name
                            ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {book.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 오른쪽: 장 */}
                <div>
                  <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    장
                  </div>
                  <div className="overflow-y-auto max-h-[350px]">
                    {(() => {
                      const selectedBook = availableBooks.find(b => b.name === selectedBookForNav);
                      const chapterCount = selectedBook?.chapters || BOOK_CHAPTERS[selectedBookForNav] || 0;

                      return Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapterNum) => (
                        <button
                          key={chapterNum}
                          onClick={() => handleBookChapterSelect(selectedBookForNav, chapterNum)}
                          className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                            selectedBookForNav === decodedBook && chapterNum === chapter
                              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {chapterNum}장
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>

        {/* 첫 번째 번역본 선택 */}
        <div className="relative">
          <select
            value={translation}
            onChange={(e) => handleTranslationChange(e.target.value)}
            className="px-4 py-2 pr-10 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-300 dark:border-slate-700 text-black dark:text-slate-100 outline-none cursor-pointer appearance-none"
          >
            {TRANSLATIONS.map((t) => (
              <option key={t.code} value={t.code} disabled={!t.available}>
                {t.name} {!t.available ? '(준비중)' : ''}
              </option>
            ))}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black dark:text-slate-100">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {/* 두 번째 번역본 선택 (병렬 보기용) */}
        <div className="relative">
          <select
            value={isParallelView ? secondTranslation : ""}
            onChange={(e) => {
              if (e.target.value) {
                setSecondTranslation(e.target.value);
                setIsParallelView(true);
              } else {
                setIsParallelView(false);
              }
            }}
            className="px-4 py-2 pr-10 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-300 dark:border-slate-700 text-black dark:text-slate-100 outline-none cursor-pointer appearance-none"
          >
            <option value="">번역본 선택</option>
            {TRANSLATIONS.filter(t => t.code !== translation).map((t) => (
              <option key={t.code} value={t.code} disabled={!t.available}>
                {t.name} {!t.available ? '(준비중)' : ''}
              </option>
            ))}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black dark:text-slate-100">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {/* 병렬 보기 해제 버튼 */}
        {isParallelView && (
          <button
            onClick={() => setIsParallelView(false)}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all text-sm"
          >
            ✕ 병렬보기 해제
          </button>
        )}

        <div className="flex-1"></div>

        {/* 글자 크기 설정 버튼 */}
        <div className="relative" ref={fontSizeMenuRef}>
          <button
            onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
            className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all relative"
          >
            <span className="text-xs translate-y-0.5">가</span>
            <span className="text-base font-bold -translate-y-0.5">가</span>
          </button>

          {/* 글자 크기 설정 메뉴 */}
          {showFontSizeMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 w-[300px] p-4">
              {/* 글자 크기 */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">글자 크기</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`py-2 rounded-lg transition-all ${
                        fontSize === size
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                      style={{ fontSize: `${10 + size * 2}px` }}
                    >
                      가
                    </button>
                  ))}
                </div>
              </div>

              {/* 글자 굵기 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">글자 굵기</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFontWeight("normal")}
                    className={`py-2 rounded-lg transition-all ${
                      fontWeight === "normal"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    보통
                  </button>
                  <button
                    onClick={() => setFontWeight("bold")}
                    className={`py-2 rounded-lg transition-all font-bold ${
                      fontWeight === "bold"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
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
          onClick={toggleChapterBookmark}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
            isChapterBookmarked
              ? "bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
          title={isChapterBookmarked ? "책갈피 해제" : "책갈피 추가"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isChapterBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            className={`w-5 h-5 ${isChapterBookmarked ? "text-white" : "text-slate-700 dark:text-slate-200"}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </div>

      {/* 구절 표시 영역 */}
      {isParallelView ? (
        /* 병렬 보기 모드 */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 첫 번째 번역본 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 py-4">
              {decodedBook} {chapter}장 [{TRANSLATIONS.find(t => t.code === translation)?.name}]
            </h2>
            {verses.map((v) => {
              const highlightColor = highlightedVerseIds.get(v.id);
              const hasHighlight = !!highlightColor;

              return (
                <div
                  key={v.id}
                  onClick={(e) => handleVerseClick(e, v)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm min-w-[2rem]">
                      {v.verse}
                    </span>
                    <div className={`leading-relaxed flex-1 text-slate-800 dark:text-slate-200 ${getFontSizeClass(fontSize)} ${fontWeight === "bold" ? "font-bold" : "font-normal"}`}>
                      <span
                        className={
                          hasHighlight
                            ? `${getBackgroundColorClass(highlightColor)} px-1 py-0.5 rounded`
                            : ""
                        }
                      >
                        {v.text}
                      </span>
                      {hasNote && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openNoteModal(v);
                          }}
                          className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all align-middle"
                          title="메모 보기"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-600 dark:text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 두 번째 번역본 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 py-4">
              {decodedBook} {chapter}장 [{TRANSLATIONS.find(t => t.code === secondTranslation)?.name}]
            </h2>
            {secondVerses.map((v) => (
              <div
                key={v.id}
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm min-w-[2rem]">
                    {v.verse}
                  </span>
                  <div className={`leading-relaxed flex-1 text-slate-800 dark:text-slate-200 ${getFontSizeClass(fontSize)} ${fontWeight === "bold" ? "font-bold" : "font-normal"}`}>
                    {v.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 일반 보기 모드 */
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 py-4">
            {decodedBook} {chapter}장 [{TRANSLATIONS.find(t => t.code === translation)?.name}]
          </h2>
          {verses.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              구절을 찾을 수 없습니다.
            </div>
          )}
          {verses.map((v) => {
          const highlightColor = highlightedVerseIds.get(v.id);
          const hasHighlight = !!highlightColor;

          return (
            <div
              key={v.id}
              onClick={(e) => handleVerseClick(e, v)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
            >
              <div className="flex items-start gap-3">
                <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm min-w-[2rem]">
                  {v.verse}
                </span>
                <div className={`leading-relaxed flex-1 text-slate-800 dark:text-slate-200 ${getFontSizeClass(fontSize)} ${fontWeight === "bold" ? "font-bold" : "font-normal"}`}>
                  <span
                    className={
                      hasHighlight
                        ? `${getBackgroundColorClass(highlightColor)} px-1 py-0.5 rounded`
                        : ""
                    }
                  >
                    {v.text}
                  </span>
                  {hasNote && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openNoteModal(v);
                      }}
                      className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all align-middle"
                      title="메모 보기"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-600 dark:text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
        </div>
      )}

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
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
          {highlightedVerseIds.has(contextMenu.verse.id) ? (
            <button
              onClick={() => removeHighlight(contextMenu.verse)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
            >
              <span className="text-amber-500">✨</span>
              하이라이트 해제
            </button>
          ) : (
            <>
              <button
                onClick={toggleColorPicker}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">✨</span>
                  하이라이트
                </div>
                <span className="text-xs">{contextMenu.showColorPicker ? "▲" : "▼"}</span>
              </button>

              {contextMenu.showColorPicker && (
                <div className="px-2 py-2 space-y-1">
                  {[
                    { name: "노란색", color: "yellow", class: "bg-yellow-400" },
                    { name: "초록색", color: "green", class: "bg-green-400" },
                    { name: "파란색", color: "blue", class: "bg-blue-400" },
                    { name: "분홍색", color: "pink", class: "bg-pink-400" },
                    { name: "보라색", color: "purple", class: "bg-purple-400" },
                    { name: "주황색", color: "orange", class: "bg-orange-400" },
                  ].map((item) => (
                    <button
                      key={item.color}
                      onClick={() => addHighlight(contextMenu.verse, item.color)}
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

          <button
            onClick={() => openNoteModal(contextMenu.verse)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-600 dark:text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            {notedVerseIds.has(contextMenu.verse.id) ? "메모 보기" : "메모 작성"}
          </button>
        </div>
      )}

      {/* 메모 모달 */}
      {noteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {isEditMode
                  ? notedVerseIds.has(noteModal.id)
                    ? "메모 수정"
                    : "메모 작성"
                  : "메모 보기"}
              </h3>

              {/* 보기 모드: 수정 버튼 */}
              {!isEditMode && (
                <button
                  onClick={enterEditMode}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium px-3 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  수정
                </button>
              )}

              {/* 편집 모드: 삭제 버튼 */}
              {isEditMode && notedVerseIds.has(noteModal.id) && (
                <button
                  onClick={deleteNote}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              {decodedBook} {chapter}:{noteModal.verse}
            </p>

            {/* 편집 모드: 에디터 */}
            {isEditMode ? (
              <>
                <RichTextEditor
                  content={note}
                  onChange={setNote}
                  placeholder="묵상 내용을 입력하세요..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveNote}
                    className="flex-1 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                  >
                    저장
                  </button>
                  <button
                    onClick={closeNoteModal}
                    className="flex-1 rounded px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200"
                  >
                    취소
                  </button>
                </div>
              </>
            ) : (
              /* 보기 모드: 메모 내용 표시 */
              <>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 max-h-[400px] overflow-y-auto">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: note }}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeNoteModal}
                    className="rounded px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200"
                  >
                    닫기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
