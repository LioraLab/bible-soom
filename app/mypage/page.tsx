import { authGuard } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const guard = await authGuard();

  if ("error" in guard) {
    // 로그인 필요
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          로그인이 필요합니다
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          마이페이지를 이용하려면 로그인이 필요합니다.
        </p>
        <a
          href="/"
          className="inline-block rounded-lg bg-indigo-600 dark:bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  const { supabase, user } = guard;

  const [notes, highlights, bookmarks] = await Promise.all([
    supabase
      .from("notes")
      .select("id, content, verses!inner(book, chapter, verse)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("highlights")
      .select("id, color, verses!inner(book, chapter, verse)")
      .eq("user_id", user.id),
    supabase
      .from("bookmarks")
      .select("id, verses!inner(book, chapter, verse)")
      .eq("user_id", user.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <header className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">마이페이지</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{user.email}</p>
          </div>
          <a
            href="/"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
          >
            ← 홈으로
          </a>
        </div>
      </header>

      <Section title="📝 메모" items={notes.data ?? []} isNote />
      <Section title="✨ 하이라이트" items={highlights.data ?? []} />
      <Section title="🔖 북마크" items={bookmarks.data ?? []} />
    </div>
  );
}

function Section({
  title,
  items,
  isNote = false,
}: {
  title: string;
  items: any[];
  isNote?: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-4">없음</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {/* @ts-ignore */}
                {item.verses.book} {item.verses.chapter}:
                {/* @ts-ignore */}
                {item.verses.verse}
              </p>
              {isNote && (
                <div
                  className="mt-2 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
