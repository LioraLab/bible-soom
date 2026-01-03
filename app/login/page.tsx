"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createBrowserSupabase();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper-50 dark:bg-primary-950 relative overflow-hidden transition-colors duration-500">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-paper-200 dark:bg-primary-900/20 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-stone-200 dark:bg-primary-800/10 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="max-w-md w-full space-y-10 relative z-10">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-black tracking-tight text-primary-800 dark:text-primary-50 mb-4">
            Bible Soom
          </h1>
          <p className="text-stone-500 dark:text-primary-300 font-bold">
            말씀의 흐름 속으로 다시 들어오세요
          </p>
        </div>

        <div className="bg-white/80 dark:bg-primary-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-primary-900/5 p-10 border border-white/50 dark:border-primary-800 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-black uppercase tracking-widest text-stone-400 dark:text-primary-400 mb-3 ml-1"
              >
                이메일 주소
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border border-stone-200 dark:border-primary-800 bg-paper-50 dark:bg-primary-950 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium placeholder-stone-400 dark:placeholder-primary-700"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-black uppercase tracking-widest text-stone-400 dark:text-primary-400 mb-3 ml-1"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border border-stone-200 dark:border-primary-800 bg-paper-50 dark:bg-primary-950 text-primary-900 dark:text-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium placeholder-stone-400 dark:placeholder-primary-700"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-stone-300 dark:disabled:bg-primary-800 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  로그인 중...
                </span>
              ) : (
                <>
                  로그인하기
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-stone-500 dark:text-primary-400 text-sm font-bold">
              계정이 없으신가요?{" "}
              <a
                href="/signup"
                className="text-primary-600 dark:text-primary-300 hover:underline"
              >
                회원가입
              </a>
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="text-stone-400 dark:text-primary-500 hover:text-stone-600 dark:hover:text-primary-300 text-sm font-bold transition-colors"
          >
            ← 홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
