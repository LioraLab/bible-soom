"use client";

import { useEffect, useState } from "react";
import { TRANSLATIONS } from "@/lib/constants";

type Testament = "OT" | "NT";

interface Book {
  id: number;
  name: string;
  testament: Testament;
  chapters: number;
}

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
        const res = await fetch(`/api/v1/books?testament=${testament}`);
        const data = await res.json();
        setBooks(data.books || []);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [testament]);

  return (
    <main className="mx-auto max-w-6xl py-8 px-4">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">성경 목록</h1>
          <a
            href="/"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
          >
            ← 홈으로
          </a>
        </div>

        {/* 번역본 선택 */}
        <div className="mb-6">
          <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
            번역본 선택
          </label>
          <div className="flex gap-2 flex-wrap">
            {translations.map((t) => (
              <button
                key={t.code}
                onClick={() => t.available && setTranslation(t.code)}
                disabled={!t.available}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  t.code === translation
                    ? "bg-indigo-600 text-white"
                    : t.available
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                {t.name}
                {!t.available && <span className="ml-1 text-xs">(준비중)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 구약/신약 탭 */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTestament("OT")}
            className={`px-6 py-3 font-semibold transition-all ${
              testament === "OT"
                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            📖 구약 (39권)
          </button>
          <button
            onClick={() => setTestament("NT")}
            className={`px-6 py-3 font-semibold transition-all ${
              testament === "NT"
                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            ✝️ 신약 (27권)
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">로딩 중...</div>
      ) : selectedBook ? (
        /* 장 선택 화면 */
        <div>
          <button
            onClick={() => setSelectedBook(null)}
            className="mb-6 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-2"
          >
            ← 책 목록으로
          </button>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            {selectedBook.name} - 장 선택
          </h2>
          <div className="grid gap-3 grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapterNum) => (
              <a
                key={chapterNum}
                href={`/bible/${translation}/${encodeURIComponent(selectedBook.name)}/${chapterNum}`}
                className="flex items-center justify-center h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-slate-800 dark:text-slate-100 font-medium"
              >
                {chapterNum}
              </a>
            ))}
          </div>
        </div>
      ) : (
        /* 책 목록 화면 */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <button
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="block rounded-lg border-2 border-slate-200 dark:border-slate-700 p-4 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left"
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {book.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {book.chapters}장
              </p>
            </button>
          ))}
        </div>
      )}

      {!loading && books.length === 0 && !selectedBook && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          성경 목록이 없습니다.
        </div>
      )}
    </main>
  );
}
