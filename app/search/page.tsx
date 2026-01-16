"use client";
import { useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";

const SUGGESTED_KEYWORDS = ["사랑", "위로", "평안", "믿음", "기도", "은혜", "소망", "감사"];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [translation, setTranslation] = useState("korHRV");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // 드래그 스크롤을 위한 ref
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 검색 결과를 "책" 단위로 그룹화
  const groupedResults = useMemo(() => {
    const groups: Record<string, any[]> = {};
    results.forEach((result) => {
      const key = result.book;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(result);
    });
    return groups;
  }, [results]);

  // 책 목록 (탭으로 사용)
  const books = useMemo(() => Object.keys(groupedResults), [groupedResults]);

  // 선택된 책의 결과 (null이면 전체)
  const selectedResults = useMemo(() => {
    if (!selectedBook) return results; // 전체 결과 반환
    return groupedResults[selectedBook] || [];
  }, [selectedBook, groupedResults, results]);

  const search = async (overrideQ?: string) => {
    const query = overrideQ || q;
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setSelectedBook(null);

    try {
      const res = await fetch(
        `/api/v1/search?q=${encodeURIComponent(query)}&translation=${translation}`
      );
      const data = await res.json();
      const searchResults = data.results ?? [];
      setResults(searchResults);

      // 검색 후 "전체" 탭이 기본 선택되도록 null 유지
      // (이미 setSelectedBook(null)로 초기화되어 있음)
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // 드래그 스크롤 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 화살표 버튼으로 스크롤
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleSuggestedClick = (keyword: string) => {
    setQ(keyword);
    search(keyword);
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-primary-950 transition-colors duration-500">
      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* 헤더 섹션 */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black text-primary-900 dark:text-primary-50 tracking-tight">
            Scripture Explorer
          </h1>
          <p className="text-stone-500 dark:text-primary-300 font-medium text-lg">
            찾고 싶은 구절이나 단어를 입력하여 말씀의 깊이를 탐색하세요
          </p>
        </header>

        {/* 검색 인터페이스 */}
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white dark:bg-primary-900 rounded-[2.5rem] border border-stone-200 dark:border-primary-800 shadow-xl shadow-primary-900/5 transition-all focus-within:border-primary-400 dark:focus-within:border-primary-600">
            <div className="flex-1 flex items-center px-4 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-stone-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                className="w-full bg-transparent text-primary-900 dark:text-primary-50 py-3 focus:outline-none font-medium placeholder-stone-300 dark:placeholder-primary-700"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="어떤 말씀을 찾으시나요?"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="rounded-full bg-paper-50 dark:bg-primary-800 text-primary-800 dark:text-primary-100 px-6 py-2 focus:outline-none font-bold border-none appearance-none cursor-pointer text-sm"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
              >
                <option value="korHRV">개역개정</option>
                <option value="NIV">NIV</option>
              </select>
              <button
                onClick={() => search()}
                disabled={loading}
                className="rounded-full bg-primary-600 px-10 py-3 text-white font-black hover:bg-primary-700 disabled:bg-stone-300 dark:disabled:bg-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-500/20 flex items-center justify-center min-w-[120px]"
              >
                {loading ? <Spinner size="md" color="white" /> : "검색하기"}
              </button>
            </div>
          </div>

          {/* 추천 키워드 */}
          <div className="flex flex-wrap justify-center gap-2 px-4">
            <span className="text-xs font-black text-stone-400 dark:text-primary-500 uppercase tracking-widest mr-2 flex items-center">Suggested:</span>
            {SUGGESTED_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleSuggestedClick(keyword)}
                className="px-4 py-1.5 rounded-full bg-paper-100 dark:bg-primary-900/50 border border-stone-200 dark:border-primary-800 text-stone-600 dark:text-primary-300 text-xs font-bold hover:bg-white dark:hover:bg-primary-800 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
              >
                #{keyword}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="mt-20">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="128px" rounded="2xl" className="border border-stone-100 dark:border-primary-800" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-10">
              {/* 검색 결과 헤더 */}
              <div className="flex items-center gap-4">
                <p className="text-xs font-black text-stone-400 dark:text-primary-500 uppercase tracking-[0.2em]">
                  Search Results
                </p>
                <div className="flex-1 h-px bg-stone-200 dark:bg-primary-800"></div>
                <Badge variant="primary" size="md" className="rounded-full">
                  {results.length} found
                </Badge>
              </div>

              {/* 책별 탭 캐러셀 */}
              <div className="relative group flex items-center gap-4">
                {/* 왼쪽 화살표 */}
                <button
                  onClick={() => scroll("left")}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-primary-900 border border-stone-200 dark:border-primary-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-50 dark:hover:bg-primary-800"
                  aria-label="이전"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-primary-600 dark:text-primary-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* 탭 스크롤 영역 */}
                <div className="flex-1 relative min-w-0">
                  <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    className={`overflow-x-auto overflow-y-hidden scrollbar-hide ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  >
                    <div className="flex flex-nowrap gap-2 pb-2 px-6">
                      {/* 전체 탭 */}
                      <button
                        onClick={() => setSelectedBook(null)}
                        className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                          selectedBook === null
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                            : "bg-white dark:bg-primary-900 text-stone-600 dark:text-primary-300 border border-stone-200 dark:border-primary-800 hover:border-primary-300 dark:hover:border-primary-600"
                        }`}
                      >
                        전체
                        <span className={`ml-2 text-xs ${
                          selectedBook === null
                            ? "text-white/70"
                            : "text-stone-400 dark:text-primary-500"
                        }`}>
                          ({results.length})
                        </span>
                      </button>

                      {/* 책별 탭 */}
                      {books.map((book) => {
                        const count = groupedResults[book].length;
                        return (
                          <button
                            key={book}
                            onClick={() => setSelectedBook(book)}
                            className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                              selectedBook === book
                                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                                : "bg-white dark:bg-primary-900 text-stone-600 dark:text-primary-300 border border-stone-200 dark:border-primary-800 hover:border-primary-300 dark:hover:border-primary-600"
                            }`}
                          >
                            {book}
                            <span className={`ml-2 text-xs ${
                              selectedBook === book
                                ? "text-white/70"
                                : "text-stone-400 dark:text-primary-500"
                            }`}>
                              ({count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 양옆 페이드 효과 - 탭이 잘리지 않고 부드럽게 사라지도록 */}
                  <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-paper-50 dark:from-primary-950 via-paper-50/80 dark:via-primary-950/80 to-transparent pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-paper-50 dark:from-primary-950 via-paper-50/80 dark:via-primary-950/80 to-transparent pointer-events-none" />
                </div>

                {/* 오른쪽 화살표 */}
                <button
                  onClick={() => scroll("right")}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-primary-900 border border-stone-200 dark:border-primary-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-50 dark:hover:bg-primary-800"
                  aria-label="다음"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-primary-600 dark:text-primary-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              {/* 선택된 장의 결과 */}
              <div className="grid gap-6">
                {selectedResults.map((r, index) => (
                  <a
                    key={r.id}
                    className="group block rounded-[2.5rem] border border-stone-100 dark:border-primary-800 p-10 bg-white dark:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                    href={`/bible/${translation}/${r.book_abbr_eng || encodeURIComponent(r.book)}/${r.chapter}#${r.verse}`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-paper-50 dark:bg-primary-800 text-primary-600 dark:text-primary-300 text-[10px] font-black uppercase tracking-widest rounded-md border border-stone-100 dark:border-primary-700">
                        {r.book}
                      </span>
                      <span className="text-xs font-bold text-stone-400 dark:text-primary-500">
                        {r.chapter}:{r.verse}
                      </span>
                    </div>
                    <p className="font-bible text-2xl text-primary-900 dark:text-primary-50 leading-[1.7] tracking-tight group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                      {r.text}
                    </p>
                    <div className="mt-8 flex items-center text-stone-300 dark:text-primary-700 group-hover:text-primary-400 transition-colors text-[10px] font-black uppercase tracking-widest">
                      Go to Chapter <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-32 bg-white/50 dark:bg-primary-900/30 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-primary-800">
              <div className="text-5xl mb-6 opacity-20">🍃</div>
              <p className="text-stone-400 dark:text-primary-500 font-bold text-lg">
                찾으시는 말씀이 숲 속에 숨어있나 봅니다.<br />
                다른 검색어로 다시 찾아보시겠어요?
              </p>
            </div>
          ) : (
            /* 검색 전 초기 화면 가이드 */
            <div className="text-center py-20 animate-in fade-in duration-1000">
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-paper-100 dark:bg-primary-900 mb-8">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-300 dark:text-primary-700">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                 </svg>
               </div>
               <h2 className="text-xl font-bold text-stone-400 dark:text-primary-600 mb-2">원하는 주제나 인물을 검색해 보세요</h2>
               <p className="text-sm text-stone-300 dark:text-primary-700">예: 모세, 다윗, 산상수훈, 천국...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
