"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { TRANSLATIONS } from "@/lib/constants";
import PassageHeader, { BookInfo } from "./PassageHeader";
import VerseDisplay, { Verse } from "./VerseDisplay";
import HighlightModal, { ContextMenu } from "./HighlightModal";

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
  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  // 메모 관련 상태
  const [noteModal, setNoteModal] = useState<Verse | null>(null);
  const [note, setNote] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // 하이라이트, 북마크, 메모 데이터 상태
  const [highlightedVerseIds, setHighlightedVerseIds] = useState<Map<number, string>>(new Map());
  const [bookmarkedVerseIds, setBookmarkedVerseIds] = useState<Set<number>>(new Set());
  const [notedVerseIds, setNotedVerseIds] = useState<Set<number>>(new Set());
  const [noteContents, setNoteContents] = useState<Map<number, { id: number; content: string }>>(new Map());

  // 병렬 보기 상태
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

  // 책 목록 상태
  const [availableBooks, setAvailableBooks] = useState<BookInfo[]>([]);

  // 글자 설정 상태
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fontSize');
      return saved ? Number(saved) : 3;
    }
    return 3;
  });
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('fontWeight') as "normal" | "bold") || "normal";
    }
    return "normal";
  });

  // 책갈피 상태
  const [isChapterBookmarked, setIsChapterBookmarked] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // URL 디코딩
  const decodedBook = decodeURIComponent(book);

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
    if (!user) return;

    async function fetchUserData() {
      try {
        // 하이라이트 가져오기
        const highlightsRes = await fetch("/api/v1/highlights");
        if (highlightsRes.ok) {
          const highlightsData = await highlightsRes.json();
          const highlightMap = new Map<number, string>();
          highlightsData.highlights?.forEach((h: { verse_id: number; color?: string }) => {
            highlightMap.set(h.verse_id, h.color || "yellow");
          });
          setHighlightedVerseIds(highlightMap);
        }

        // 북마크 가져오기
        const bookmarksRes = await fetch("/api/v1/bookmarks");
        if (bookmarksRes.ok) {
          const bookmarksData = await bookmarksRes.json();
          const bookmarkIds = new Set<number>(bookmarksData.bookmarks?.map((b: { verse_id: number }) => b.verse_id) || []);
          setBookmarkedVerseIds(bookmarkIds);
        }

        // 메모 가져오기
        const notesRes = await fetch("/api/v1/notes");
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          const noteIds = new Set<number>(notesData.notes?.map((n: { verse_id: number }) => n.verse_id) || []);
          setNotedVerseIds(noteIds);

          // 메모 내용과 ID를 Map에 저장
          const contents = new Map<number, { id: number; content: string }>();
          notesData.notes?.forEach((n: { verse_id: number; id: number; content: string }) => {
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

  // 하이라이트 추가
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

  // 하이라이트 제거
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

  // 색상 선택기 토글
  function toggleColorPicker() {
    setContextMenu((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        showColorPicker: !prev.showColorPicker,
      };
    });
  }

  // 컨텍스트 메뉴 닫기
  function closeContextMenu() {
    setContextMenu(null);
  }

  // 메모 모달 열기
  function openNoteModal(v: Verse) {
    const existingNote = noteContents.get(v.id)?.content || "";
    setNote(existingNote);
    setIsEditMode(existingNote === "");
    setNoteModal(v);
    setContextMenu(null);
  }

  // 메모 저장
  async function saveNote() {
    if (!noteModal) return;

    const existingNote = noteContents.get(noteModal.id);

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
      setNoteContents((prev) => {
        const next = new Map(prev);
        next.set(noteModal.id, {
          id: existingNote ? existingNote.id : data.note.id,
          content: note
        });
        return next;
      });
      alert("메모가 저장되었습니다!");
      setNote("");
      setNoteModal(null);
      setIsEditMode(false);
    } else {
      const error = await res.json();
      alert(`메모 저장 실패: ${error.error || '알 수 없는 오류'}`);
    }
  }

  // 메모 모달 닫기
  function closeNoteModal() {
    setNote("");
    setNoteModal(null);
    setIsEditMode(false);
  }

  // 편집 모드 진입
  function enterEditMode() {
    setIsEditMode(true);
  }

  // 메모 삭제
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

  // 번역본 변경 핸들러
  function handleTranslationChange(newTranslation: string) {
    const encodedBook = encodeURIComponent(decodedBook);
    router.push(`/bible/${newTranslation}/${encodedBook}/${chapter}`);
  }

  // 두 번째 번역본 변경 핸들러
  function handleSecondTranslationChange(newTranslation: string, isParallel: boolean) {
    setSecondTranslation(newTranslation);
    setIsParallelView(isParallel);
  }

  // 이전 장으로 이동
  function goToPreviousChapter() {
    const encodedBook = encodeURIComponent(decodedBook);
    const prevChapter = chapter - 1;
    if (prevChapter >= 1) {
      router.push(`/bible/${translation}/${encodedBook}/${prevChapter}`);
    }
  }

  // 다음 장으로 이동
  function goToNextChapter() {
    const encodedBook = encodeURIComponent(decodedBook);
    const nextChapter = chapter + 1;
    router.push(`/bible/${translation}/${encodedBook}/${nextChapter}`);
  }

  // 책/장 선택 핸들러
  function handleBookChapterSelect(selectedBook: string, selectedChapter: number) {
    const encodedBook = encodeURIComponent(selectedBook);
    router.push(`/bible/${translation}/${encodedBook}/${selectedChapter}`);
  }

  // 책갈피 토글
  function toggleChapterBookmark() {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('chapterBookmarks') || '[]');
      const key = `${decodedBook}-${chapter}`;

      if (isChapterBookmarked) {
        const updated = bookmarks.filter((b: string) => b !== key);
        localStorage.setItem('chapterBookmarks', JSON.stringify(updated));
        setIsChapterBookmarked(false);
        alert('책갈피가 해제되었습니다!');
      } else {
        bookmarks.push(key);
        localStorage.setItem('chapterBookmarks', JSON.stringify(bookmarks));
        setIsChapterBookmarked(true);
        alert('책갈피가 추가되었습니다!');
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 py-8 space-y-6 relative">
      {/* 헤더 컴포넌트 */}
      <PassageHeader
        book={decodedBook}
        chapter={chapter}
        translation={translation}
        isParallelView={isParallelView}
        secondTranslation={secondTranslation}
        availableBooks={availableBooks}
        fontSize={fontSize}
        fontWeight={fontWeight}
        isChapterBookmarked={isChapterBookmarked}
        onTranslationChange={handleTranslationChange}
        onSecondTranslationChange={handleSecondTranslationChange}
        onParallelViewClose={() => setIsParallelView(false)}
        onFontSizeChange={setFontSize}
        onFontWeightChange={setFontWeight}
        onChapterBookmarkToggle={toggleChapterBookmark}
        onNavigatePrevious={goToPreviousChapter}
        onNavigateNext={goToNextChapter}
        onBookChapterSelect={handleBookChapterSelect}
      />

      {/* 구절 표시 영역 */}
      {isParallelView ? (
        /* 병렬 보기 모드 */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 첫 번째 번역본 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 py-4">
              {decodedBook} {chapter}장 [{TRANSLATIONS.find(t => t.code === translation)?.name}]
            </h2>
            {verses.map((v) => (
              <VerseDisplay
                key={v.id}
                verse={v}
                highlightColor={highlightedVerseIds.get(v.id)}
                hasNote={notedVerseIds.has(v.id)}
                fontSize={fontSize}
                fontWeight={fontWeight}
                onVerseClick={handleVerseClick}
                onNoteClick={(e, verse) => openNoteModal(verse)}
              />
            ))}
          </div>

          {/* 두 번째 번역본 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 py-4">
              {decodedBook} {chapter}장 [{TRANSLATIONS.find(t => t.code === secondTranslation)?.name}]
            </h2>
            {secondVerses.map((v) => (
              <VerseDisplay
                key={v.id}
                verse={v}
                hasNote={false}
                fontSize={fontSize}
                fontWeight={fontWeight}
                onVerseClick={() => {}}
                onNoteClick={() => {}}
                isInteractive={false}
              />
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
          {verses.map((v) => (
            <VerseDisplay
              key={v.id}
              verse={v}
              highlightColor={highlightedVerseIds.get(v.id)}
              hasNote={notedVerseIds.has(v.id)}
              fontSize={fontSize}
              fontWeight={fontWeight}
              onVerseClick={handleVerseClick}
              onNoteClick={(e, verse) => openNoteModal(verse)}
            />
          ))}
        </div>
      )}

      {/* 하이라이트/컨텍스트 메뉴 모달 */}
      <HighlightModal
        contextMenu={contextMenu}
        isHighlighted={contextMenu ? highlightedVerseIds.has(contextMenu.verse.id) : false}
        hasNote={contextMenu ? notedVerseIds.has(contextMenu.verse.id) : false}
        onClose={closeContextMenu}
        onAddHighlight={addHighlight}
        onRemoveHighlight={removeHighlight}
        onToggleColorPicker={toggleColorPicker}
        onOpenNote={openNoteModal}
      />

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
