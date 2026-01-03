"use client";
import { useState } from "react";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [translation, setTranslation] = useState("kor");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const res = await fetch(
      `/api/v1/search?q=${encodeURIComponent(q)}&translation=${translation}`
    );
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <header className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">검색</h1>
          <a
            href="/"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
          >
            ← 홈으로
          </a>
        </div>
      </header>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="검색어를 입력하세요..."
        />
        <select
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
        >
          <option value="kor">개역개정4판</option>
          <option value="niv">NIV</option>
        </select>
        <button
          onClick={search}
          disabled={loading}
          className="rounded-lg bg-indigo-600 dark:bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {results.length}개의 결과가 있습니다.
          </p>
          {results.map((r) => (
            <a
              key={r.id}
              className="block rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
              href={`/bible/${translation}/${r.book}/${r.chapter}#${r.verse}`}
            >
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {r.book} {r.chapter}:{r.verse}
              </p>
              <p className="mt-1 text-slate-800 dark:text-slate-200">{r.text}</p>
            </a>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && q && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
}
