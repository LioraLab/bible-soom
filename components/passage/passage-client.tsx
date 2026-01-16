"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { TRANSLATIONS } from "@/lib/constants";
import { Tab } from "@headlessui/react";
import PassageHeader, { BookInfo } from "./PassageHeader";
import GlobalHeader from "./GlobalHeader";
import BiblePanel from "./BiblePanel";
import VerseDisplay, { Verse } from "./VerseDisplay";
import HighlightModal, { ContextMenu } from "./HighlightModal";

// Panel configuration interface
export interface PanelConfig {
  id: string;                    // 'panel-1', 'panel-2', 'panel-3'
  translation: string;           // Translation code
  bookAbbrEng: string;           // English book abbreviation (Gen, Exo, Matt)
  bookName: string;              // Localized book name for display
  chapter: number;               // Chapter number
  verses: Verse[];               // Loaded verses
  isLoading: boolean;            // Loading state
  error?: string;                // Error message if fetch failed
}

export default function PassageClient({
  translation,
  translationName,
  bookAbbrEng,
  bookName,
  chapter,
  verses,
  availableBooks,
}: {
  translation: string;
  translationName: string;
  bookAbbrEng: string;
  bookName: string;
  chapter: number;
  verses: Verse[];
  availableBooks: BookInfo[];
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

  // 패널 시스템 상태 (최대 3개 패널)
  const [panels, setPanels] = useState<PanelConfig[]>([
    {
      id: 'panel-1',
      translation,
      bookAbbrEng,
      bookName,
      chapter,
      verses,
      isLoading: false
    }
  ]);

  // 글자 설정 상태
  const [fontSize, setFontSize] = useState(3);
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("normal");

  // 책갈피 상태
  const [isChapterBookmarked, setIsChapterBookmarked] = useState(false);

  // 모바일/데스크톱 감지
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // 클라이언트 사이드에서 localStorage 값 읽어오기 (hydration mismatch 방지)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 글자 설정 불러오기
      const savedFontSize = localStorage.getItem('fontSize');
      const savedFontWeight = localStorage.getItem('fontWeight') as "normal" | "bold" | null;
      if (savedFontSize) setFontSize(Number(savedFontSize));
      if (savedFontWeight) setFontWeight(savedFontWeight);

      // 패널 2-3 복원 (마이그레이션 포함)
      let panelsToRestore: Array<{ translation: string; bookAbbrEng?: string; book?: string; bookName?: string; chapter: number }> = [];

      const savedPanels = localStorage.getItem('biblePanels');
      if (savedPanels) {
        try {
          panelsToRestore = JSON.parse(savedPanels);
        } catch (e) {
          console.error('Failed to parse biblePanels:', e);
        }
      } else {
        // 마이그레이션: 기존 isParallelView에서 변환
        const oldParallelView = localStorage.getItem('isParallelView') === 'true';
        const oldSecondTranslation = localStorage.getItem('secondTranslation');

        if (oldParallelView && oldSecondTranslation) {
          panelsToRestore = [{
            translation: oldSecondTranslation,
            bookAbbrEng: bookAbbrEng,
            chapter: chapter
          }];
          // 마이그레이션 후 기존 키 제거
          localStorage.removeItem('isParallelView');
          localStorage.removeItem('secondTranslation');
        }
      }

      // 패널 복원 (검증 및 마이그레이션 포함)
      if (panelsToRestore.length > 0) {
        const newPanels = panelsToRestore
          .filter(p => p.translation && (p.bookAbbrEng || p.book) && p.chapter)
          .slice(0, 2) // 최대 2개 (panel-2, panel-3)
          .map((p, index) => ({
            id: `panel-${index + 2}`,
            translation: p.translation,
            bookAbbrEng: p.bookAbbrEng || bookAbbrEng, // 마이그레이션: 없으면 현재 bookAbbrEng 사용
            bookName: p.bookName || '', // 일단 빈 문자열, fetchPanelData에서 채워짐
            chapter: p.chapter,
            verses: [],
            isLoading: true
          }));

        if (newPanels.length > 0) {
          setPanels(current => [...current, ...newPanels]);
          // 각 패널 데이터 가져오기
          newPanels.forEach(panel => {
            fetchPanelData(panel.id, panel.translation, panel.bookAbbrEng, panel.chapter);
          });
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 패널 2-3 상태를 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && panels.length > 1) {
      const panelsToSave = panels.slice(1).map(p => ({
        translation: p.translation,
        bookAbbrEng: p.bookAbbrEng,
        bookName: p.bookName,
        chapter: p.chapter
      }));
      localStorage.setItem('biblePanels', JSON.stringify(panelsToSave));
    } else if (typeof window !== 'undefined' && panels.length === 1) {
      // 모든 패널이 제거되면 localStorage도 정리
      localStorage.removeItem('biblePanels');
    }
  }, [panels]);

  // 글자 크기와 굵기를 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', String(fontSize));
      localStorage.setItem('fontWeight', fontWeight);
    }
  }, [fontSize, fontWeight]);

  // 현재 책/장의 북마크 상태 확인 (마이그레이션 포함)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let bookmarks = JSON.parse(localStorage.getItem('chapterBookmarks') || '[]');

      // 마이그레이션: 한글 책 이름을 영어 약어로 변환
      let needsMigration = false;
      bookmarks = bookmarks.map((bookmark: string) => {
        // 이미 영어 약어 형식이면 그대로 반환
        if (/^[A-Za-z]+-\d+$/.test(bookmark)) {
          return bookmark;
        }
        // 한글 포함하면 마이그레이션 필요
        needsMigration = true;
        const parts = bookmark.split('-');
        const chapterNum = parts[parts.length - 1];
        // 현재 책이 해당 북마크와 일치하면 새 형식으로 변환
        if (bookmark.startsWith(bookName)) {
          return `${bookAbbrEng}-${chapterNum}`;
        }
        // 매칭 안 되면 삭제 (마이그레이션 불가)
        return null;
      }).filter(Boolean);

      if (needsMigration) {
        localStorage.setItem('chapterBookmarks', JSON.stringify(bookmarks));
      }

      const key = `${bookAbbrEng}-${chapter}`;
      setIsChapterBookmarked(bookmarks.includes(key));
    }
  }, [bookAbbrEng, bookName, chapter]);

  // 모바일/데스크톱 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Panel-1을 URL props와 동기화
  useEffect(() => {
    setPanels(current => current.map(p =>
      p.id === 'panel-1'
        ? { ...p, translation, bookAbbrEng, bookName, chapter, verses, isLoading: false }
        : p
    ));
  }, [translation, bookAbbrEng, bookName, chapter, verses]);

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

  // ========== 패널 관리 함수 ==========

  // 패널 데이터 가져오기 (panels 2-3용)
  async function fetchPanelData(panelId: string, translation: string, bookAbbrEng: string, chapter: number) {
    const res = await fetch(`/api/v1/passages?translation=${translation}&book=${bookAbbrEng}&chapter=${chapter}`);

    if (res.ok) {
      const data = await res.json();
      setPanels(current => current.map(p =>
        p.id === panelId ? {
          ...p,
          bookAbbrEng: data.book || bookAbbrEng,
          bookName: data.book_name || '',
          verses: data.verses || [],
          isLoading: false,
          error: undefined
        } : p
      ));
    } else {
      const errorData = await res.json().catch(() => ({ error: 'Failed to load' }));
      setPanels(current => current.map(p =>
        p.id === panelId ? { ...p, isLoading: false, error: errorData.error || 'Failed to load' } : p
      ));
    }
  }

  // 패널 추가 (최대 3개)
  function addPanel() {
    if (panels.length >= 3) return;

    const newPanel: PanelConfig = {
      id: `panel-${panels.length + 1}`,
      translation: 'NIV',
      bookAbbrEng: panels[0].bookAbbrEng,  // 첫 번째 패널과 동일한 책/장으로 시작
      bookName: '',                         // fetchPanelData에서 채워짐
      chapter: panels[0].chapter,
      verses: [],
      isLoading: true
    };

    setPanels([...panels, newPanel]);
    fetchPanelData(newPanel.id, newPanel.translation, newPanel.bookAbbrEng, newPanel.chapter);
  }

  // 패널 제거 (panel-1은 제거 불가)
  function removePanel(panelId: string) {
    if (panels.length === 1 || panelId === 'panel-1') return;
    setPanels(panels.filter(p => p.id !== panelId));
  }

  // 패널 내비게이션 업데이트
  function updatePanelNavigation(panelId: string, bookAbbrEng: string, chapter: number) {
    if (panelId === 'panel-1') {
      // Panel-1: URL 업데이트
      const panel = panels.find(p => p.id === panelId)!;
      router.push(`/bible/${panel.translation}/${bookAbbrEng}/${chapter}`);
    } else {
      // Panels 2-3: 상태 업데이트 및 데이터 fetch
      const panel = panels.find(p => p.id === panelId)!;
      setPanels(panels.map(p =>
        p.id === panelId ? { ...p, bookAbbrEng, chapter, isLoading: true } : p
      ));
      fetchPanelData(panelId, panel.translation, bookAbbrEng, chapter);
    }
  }

  // 패널 번역본 변경
  function updatePanelTranslation(panelId: string, newTranslation: string) {
    const panel = panels.find(p => p.id === panelId)!;

    if (panelId === 'panel-1') {
      // Panel-1: URL 업데이트
      router.push(`/bible/${newTranslation}/${panel.bookAbbrEng}/${panel.chapter}`);
    } else {
      // Panels 2-3: 상태 업데이트 및 데이터 fetch
      setPanels(panels.map(p =>
        p.id === panelId ? { ...p, translation: newTranslation, isLoading: true } : p
      ));
      fetchPanelData(panelId, newTranslation, panel.bookAbbrEng, panel.chapter);
    }
  }

  // ========== 레거시 핸들러 (PassageHeader 호환용) ==========

  // 번역본 변경 핸들러 (panel-1용)
  function handleTranslationChange(newTranslation: string) {
    router.push(`/bible/${newTranslation}/${bookAbbrEng}/${chapter}`);
  }

  // 두 번째 번역본 변경 핸들러 (레거시 - 현재는 패널 추가로 대체)
  function handleSecondTranslationChange(newTranslation: string, isParallel: boolean) {
    if (isParallel && panels.length < 3) {
      // 병렬 보기 활성화 → 패널 추가
      const newPanel: PanelConfig = {
        id: `panel-${panels.length + 1}`,
        translation: newTranslation,
        bookAbbrEng: bookAbbrEng,
        bookName: '',  // fetchPanelData에서 채워짐
        chapter: chapter,
        verses: [],
        isLoading: true
      };
      setPanels([...panels, newPanel]);
      fetchPanelData(newPanel.id, newPanel.translation, newPanel.bookAbbrEng, newPanel.chapter);
    }
  }

  // 이전 장으로 이동
  function goToPreviousChapter() {
    const prevChapter = chapter - 1;
    if (prevChapter >= 1) {
      router.push(`/bible/${translation}/${bookAbbrEng}/${prevChapter}`);
    }
  }

  // 다음 장으로 이동
  function goToNextChapter() {
    const nextChapter = chapter + 1;
    router.push(`/bible/${translation}/${bookAbbrEng}/${nextChapter}`);
  }

  // 책/장 선택 핸들러
  function handleBookChapterSelect(selectedBookAbbr: string, selectedChapter: number) {
    router.push(`/bible/${translation}/${selectedBookAbbr}/${selectedChapter}`);
  }

  // 책갈피 토글
  function toggleChapterBookmark() {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('chapterBookmarks') || '[]');
      const key = `${bookAbbrEng}-${chapter}`;

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
      {/* 전역 헤더 */}
      <GlobalHeader
        fontSize={fontSize}
        fontWeight={fontWeight}
        isChapterBookmarked={isChapterBookmarked}
        currentPanelCount={panels.length}
        onFontSizeChange={setFontSize}
        onFontWeightChange={setFontWeight}
        onChapterBookmarkToggle={toggleChapterBookmark}
        onAddPanel={addPanel}
      />

      {/* 패널 영역 - 반응형 레이아웃 */}
      {isMobile ? (
        /* 모바일: 탭 인터페이스 */
        <Tab.Group>
          <Tab.List className="flex gap-2 border-b border-stone-200 dark:border-primary-800 overflow-x-auto pb-2 mb-6">
            {panels.map((panel) => (
              <Tab
                key={panel.id}
                className={({ selected }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${
                    selected
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-stone-100 dark:bg-primary-900 text-stone-600 dark:text-primary-200 hover:bg-stone-200 dark:hover:bg-primary-800'
                  }`
                }
              >
                <span>{TRANSLATIONS.find(t => t.code === panel.translation)?.name}</span>
                {panel.id !== 'panel-1' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePanel(panel.id);
                    }}
                    className="ml-1 hover:text-red-300 transition-colors"
                    title="패널 닫기"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {panels.map((panel) => (
              <Tab.Panel key={panel.id} unmount={false}>
                <BiblePanel
                  panel={panel}
                  availableBooks={availableBooks}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  highlightedVerseIds={highlightedVerseIds}
                  notedVerseIds={notedVerseIds}
                  onVerseClick={handleVerseClick}
                  onNoteClick={(e, verse) => openNoteModal(verse)}
                  onTranslationChange={updatePanelTranslation}
                  onNavigatePrevious={(panelId) => {
                    const panel = panels.find(p => p.id === panelId)!;
                    updatePanelNavigation(panelId, panel.bookAbbrEng, panel.chapter - 1);
                  }}
                  onNavigateNext={(panelId) => {
                    const panel = panels.find(p => p.id === panelId)!;
                    updatePanelNavigation(panelId, panel.bookAbbrEng, panel.chapter + 1);
                  }}
                  onBookChapterSelect={updatePanelNavigation}
                  onClose={removePanel}
                />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      ) : (
        /* 데스크톱: 그리드 레이아웃 */
        <div className={`grid gap-8 ${
          panels.length === 1 ? 'grid-cols-1' :
          panels.length === 2 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {panels.map((panel) => (
            <BiblePanel
              key={panel.id}
              panel={panel}
              availableBooks={availableBooks}
              fontSize={fontSize}
              fontWeight={fontWeight}
              highlightedVerseIds={highlightedVerseIds}
              notedVerseIds={notedVerseIds}
              onVerseClick={handleVerseClick}
              onNoteClick={(e, verse) => openNoteModal(verse)}
              onTranslationChange={updatePanelTranslation}
              onNavigatePrevious={(panelId) => {
                const panel = panels.find(p => p.id === panelId)!;
                updatePanelNavigation(panelId, panel.bookAbbrEng, panel.chapter - 1);
              }}
              onNavigateNext={(panelId) => {
                const panel = panels.find(p => p.id === panelId)!;
                updatePanelNavigation(panelId, panel.bookAbbrEng, panel.chapter + 1);
              }}
              onBookChapterSelect={updatePanelNavigation}
              onClose={removePanel}
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
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-primary-900 rounded-[2rem] shadow-2xl shadow-primary-900/20 max-w-2xl w-full overflow-hidden border border-stone-100 dark:border-primary-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* 헤더 */}
            <div className="px-8 py-6 bg-paper-50 dark:bg-primary-950 border-b border-stone-100 dark:border-primary-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary-900 dark:text-primary-50 tracking-tight mb-1">
                  {isEditMode
                    ? notedVerseIds.has(noteModal.id)
                      ? "Edit Reflection"
                      : "New Reflection"
                    : "Reflection Note"}
                </h3>
                <p className="text-sm font-bold text-stone-500 dark:text-primary-400 font-bible">
                  {bookName} {chapter}:{noteModal.verse}
                </p>
              </div>

              <div className="flex gap-2">
                {/* 보기 모드: 수정 버튼 */}
                {!isEditMode && (
                  <button
                    onClick={enterEditMode}
                    className="p-2 rounded-xl text-primary-600 dark:text-primary-300 hover:bg-white dark:hover:bg-primary-800 border border-transparent hover:border-stone-200 dark:hover:border-primary-700 transition-all shadow-sm"
                    title="수정"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                )}

                {/* 편집 모드: 삭제 버튼 */}
                {isEditMode && notedVerseIds.has(noteModal.id) && (
                  <button
                    onClick={deleteNote}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 transition-all"
                    title="삭제"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={closeNoteModal}
                  className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 dark:hover:bg-primary-800 transition-all"
                  title="닫기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="p-8">
              {/* 편집 모드: 에디터 */}
              {isEditMode ? (
                <div className="space-y-6">
                  <div className="relative">
                    <RichTextEditor
                      content={note}
                      onChange={setNote}
                      placeholder="이 말씀이 당신에게 어떤 의미인가요?"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={closeNoteModal}
                      className="px-6 py-3 rounded-xl text-sm font-bold text-stone-500 dark:text-primary-400 hover:bg-stone-100 dark:hover:bg-primary-800 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={saveNote}
                      className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-black shadow-lg shadow-primary-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <span>저장하기</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                /* 보기 모드: 메모 내용 표시 */
                <div className="min-h-[200px]">
                  <div className="relative pl-6 border-l-2 border-primary-200 dark:border-primary-700">
                    <div
                      className="prose prose-stone dark:prose-invert max-w-none font-medium text-lg leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: note }}
                    />
                  </div>
                  <div className="mt-8 pt-6 border-t border-stone-100 dark:border-primary-800 text-right">
                    <span className="text-xs font-bold text-stone-400 dark:text-primary-500 uppercase tracking-widest">
                      Saved Reflection
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
