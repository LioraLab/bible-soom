"use client";
import { useState } from "react";

const SUGGESTED_KEYWORDS = ["사랑", "위로", "평안", "믿음", "기도", "은혜", "소망", "감사"];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [translation, setTranslation] = useState("kor");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = async (overrideQ?: string) => {
    const query = overrideQ || q;
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(
        `/api/v1/search?q=${encodeURIComponent(query)}&translation=${translation}`
      );
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
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
                <option value="kor">개역개정</option>
                <option value="niv">NIV</option>
              </select>
              <button
                onClick={() => search()}
                disabled={loading}
                className="rounded-full bg-primary-600 px-10 py-3 text-white font-black hover:bg-primary-700 disabled:bg-stone-300 dark:disabled:bg-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-500/20 flex items-center justify-center min-w-[120px]"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "검색하기"
                )}
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
                <div key={i} className="h-32 bg-white dark:bg-primary-900 rounded-[2rem] border border-stone-100 dark:border-primary-800 animate-pulse" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <p className="text-xs font-black text-stone-400 dark:text-primary-500 uppercase tracking-[0.2em]">
                  Search Results
                </p>
                <div className="flex-1 h-px bg-stone-200 dark:bg-primary-800"></div>
                <span className="text-xs font-black bg-primary-50 dark:bg-primary-800 text-primary-600 dark:text-primary-300 px-4 py-1 rounded-full border border-primary-100 dark:border-primary-700">
                  {results.length} found
                </span>
              </div>

              <div className="grid gap-6">
                {results.map((r, index) => (
                  <a
                    key={r.id}
                    className="group block rounded-[2.5rem] border border-stone-100 dark:border-primary-800 p-10 bg-white dark:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                    href={`/bible/${translation}/${encodeURIComponent(r.book)}/${r.chapter}#${r.verse}`}
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
