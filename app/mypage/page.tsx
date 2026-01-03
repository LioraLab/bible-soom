import { authGuard } from "@/lib/auth";
import MyPageClient from "@/components/mypage/mypage-client";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const guard = await authGuard();

  if ("error" in guard) {
    // 로그인 필요
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-50 dark:bg-primary-950 px-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 bg-white dark:bg-primary-900 rounded-[2rem] flex items-center justify-center mx-auto text-4xl shadow-xl shadow-primary-900/5 border border-stone-100 dark:border-primary-800">
            🔒
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary-900 dark:text-primary-50 mb-3 tracking-tight">
              로그인이 필요합니다
            </h1>
            <p className="text-stone-500 dark:text-primary-300 font-medium">
              나만의 서재를 이용하려면 로그인이 필요합니다.<br/>
              계정이 없다면 지금 바로 시작해보세요.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <a
              href="/login"
              className="inline-block rounded-2xl bg-white dark:bg-primary-800 px-8 py-4 text-primary-700 dark:text-primary-200 font-black hover:bg-paper-50 dark:hover:bg-primary-700 border border-stone-200 dark:border-primary-700 transition-all shadow-sm"
            >
              로그인
            </a>
            <a
              href="/signup"
              className="inline-block rounded-2xl bg-primary-600 px-8 py-4 text-white font-black hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all active:scale-95"
            >
              회원가입
            </a>
          </div>
        </div>
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
    <div className="min-h-screen bg-paper-50 dark:bg-primary-950 transition-colors duration-500">
      <MyPageClient 
        userEmail={user.email!}
        notes={notes.data ?? []}
        highlights={highlights.data ?? []}
        bookmarks={bookmarks.data ?? []}
      />
    </div>
  );
}