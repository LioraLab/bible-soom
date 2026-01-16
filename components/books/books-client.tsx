"use client";

import { useEffect, useState } from "react";
import { TRANSLATIONS } from "@/lib/constants";
import Skeleton from "@/components/ui/Skeleton";
import Tabs from "@/components/ui/Tabs";

type Testament = "OT" | "NT";

interface Book {
  id: number;
  name: string;
  abbr_eng: string;
  testament: Testament;
  chapters: number;
  book_order: number;
}

// 성경 분류 정의
const CATEGORIES = [
  { id: 'law', name: '율법서', range: [1, 5], testament: 'OT' },
  { id: 'history_ot', name: '역사서', range: [6, 17], testament: 'OT' },
  { id: 'poetry', name: '시가서', range: [18, 22], testament: 'OT' },
  { id: 'prophets', name: '선지서', range: [23, 39], testament: 'OT' },
  { id: 'gospels', name: '복음서 & 역사서', range: [40, 44], testament: 'NT' },
  { id: 'epistles', name: '서신서', range: [45, 65], testament: 'NT' },
  { id: 'prophecy', name: '예언서', range: [66, 66], testament: 'NT' },
];

export default function BooksClient() {
  const [testament, setTestament] = useState<Testament>("OT");
  const [translation, setTranslation] = useState("korHRV");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/books?testament=${testament}&translation=${translation}`);
        const data = await res.json();
        setBooks(data.books || []);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [testament, translation]);

  // 현재 선택된 구약/신약에 맞는 카테고리 필터링
  const currentCategories = CATEGORIES.filter(c => c.testament === testament);

  // 책을 카테고리별로 그룹화
  const getBooksByCategory = (category: typeof CATEGORIES[0]) => {
    return books.filter(b => b.book_order >= category.range[0] && b.book_order <= category.range[1]);
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-primary-950 transition-colors duration-500">
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* 헤더 영역 */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary-900 dark:text-primary-50 tracking-tight">
              Scripture Library
            </h1>
            <p className="text-stone-500 dark:text-primary-300 font-medium text-lg">
              말씀의 숲에서 당신에게 필요한 책을 꺼내보세요
            </p>
          </div>
          
          <div className="flex gap-3">
             {/* 구약/신약 토글 */}
            <div className="border border-stone-200 dark:border-primary-800 rounded-[1.25rem] shadow-sm">
              <Tabs
                tabs={[
                  { id: "OT", label: "Old Testament" },
                  { id: "NT", label: "New Testament" }
                ]}
                activeTab={testament}
                onChange={(tabId) => setTestament(tabId as Testament)}
                variant="contained"
                className="text-sm"
              />
            </div>
          </div>
        </header>

        {/* 번역본 선택 (작게 배치) */}
        <div className="mb-12 flex justify-end">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-paper-100 dark:bg-primary-900/50 rounded-2xl border border-stone-200 dark:border-primary-800">
            <span className="text-xs font-black uppercase tracking-wider text-stone-400 dark:text-primary-400 mr-2">Version</span>
            {TRANSLATIONS.map((t) => (
              <button
                key={t.code}
                onClick={() => t.available && setTranslation(t.code)}
                disabled={!t.available}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  t.code === translation
                    ? "bg-primary-600 text-white"
                    : t.available
                    ? "text-stone-500 dark:text-primary-300 hover:bg-stone-200 dark:hover:bg-primary-800"
                    : "text-stone-300 dark:text-primary-700 cursor-not-allowed"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
           <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton width="128px" height="32px" rounded="lg" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} height="160px" rounded="2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-20">
            {currentCategories.map((category) => {
              const categoryBooks = getBooksByCategory(category);
              if (categoryBooks.length === 0) return null;

              return (
                <section key={category.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-primary-900 dark:text-primary-50">{category.name}</h2>
                    <div className="h-px flex-1 bg-stone-200 dark:bg-primary-800"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryBooks.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className="group relative flex flex-col items-start p-8 h-48 rounded-[2rem] bg-white dark:bg-primary-900 border border-stone-100 dark:border-primary-800 hover:border-primary-200 dark:hover:border-primary-600 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 overflow-hidden text-left w-full"
                      >
                         {/* 배경 장식 (책 표지 느낌) */}
                         <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-paper-100 to-transparent dark:from-primary-800 dark:to-transparent rounded-bl-[4rem] opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                         
                         <span className="relative z-10 text-xs font-black text-stone-400 dark:text-primary-400 mb-auto">
                           NO. {String(book.book_order).padStart(2, '0')}
                         </span>
                         
                         <div className="relative z-10">
                           <h3 className="text-xl font-black text-primary-800 dark:text-primary-50 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                             {book.name}
                           </h3>
                           <p className="text-sm font-bold text-stone-400 dark:text-primary-400">
                             {book.chapters} Chapters
                           </p>
                         </div>

                         {/* 화살표 아이콘 */}
                         <div className="absolute bottom-8 right-8 w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                           →
                         </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* 장 선택 Drawer (오른쪽 슬라이드 패널) */}
      {/* 배경 오버레이 */}
      <div 
        className={`fixed inset-0 bg-primary-950/20 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          selectedBook ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSelectedBook(null)}
      />

      {/* 슬라이드 패널 */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-primary-950 shadow-2xl z-50 transform transition-transform duration-500 ease-out-expo ${
          selectedBook ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedBook && (
          <div className="h-full flex flex-col p-8 sm:p-10">
            {/* Drawer 헤더 */}
            <div className="flex items-start justify-between mb-10">
              <div>
                <p className="text-sm font-bold text-primary-500 mb-2">Chapter Selection</p>
                <h2 className="text-4xl font-black text-primary-900 dark:text-primary-50">
                  {selectedBook.name}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedBook(null)}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-primary-800 text-stone-400 dark:text-primary-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 장 목록 그리드 */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapterNum) => (
                  <a
                    key={chapterNum}
                    href={`/bible/${translation}/${selectedBook.abbr_eng}/${chapterNum}`}
                    className="aspect-square flex flex-col items-center justify-center rounded-2xl border border-stone-200 dark:border-primary-800 bg-paper-50 dark:bg-primary-900 text-primary-800 dark:text-primary-100 font-black text-lg hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:shadow-lg hover:shadow-primary-500/30 hover:scale-105 transition-all duration-200"
                  >
                    {chapterNum}
                    <span className="text-[10px] font-medium opacity-40 mt-0.5">장</span>
                  </a>
                ))}
              </div>
            </div>

            {/* 하단 장식 */}
            <div className="mt-8 pt-8 border-t border-stone-100 dark:border-primary-900">
               <p className="text-center text-xs font-bold text-stone-300 dark:text-primary-600 uppercase tracking-widest">
                 Bible Soom Library
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}