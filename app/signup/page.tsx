"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createBrowserSupabase();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      setSuccess(true);

      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper-50 dark:bg-primary-950 relative overflow-hidden transition-colors duration-500">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-paper-200 dark:bg-primary-900/20 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-100 dark:bg-primary-800/10 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="max-w-md w-full space-y-10 relative z-10">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-black tracking-tight text-primary-800 dark:text-primary-50 mb-4">
            Bible Soom
          </h1>
          <p className="text-stone-500 dark:text-primary-300 font-bold">
            새로운 말씀의 여정을 시작하세요
          </p>
        </div>

        <div className="bg-white/80 dark:bg-primary-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-primary-900/5 p-10 border border-white/50 dark:border-primary-800 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {success ? (
            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-primary-50 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg shadow-primary-500/10">
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary-800 dark:text-primary-50 mb-2">
                  회원가입 완료!
                </h2>
                <p className="text-stone-500 dark:text-primary-300 font-medium">
                  이메일을 확인하여 계정을 인증해주세요.<br />
                  잠시 후 로그인 페이지로 이동합니다.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
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
                <p className="mt-2 text-[10px] text-stone-400 dark:text-primary-400 font-bold ml-1">
                  최소 6자 이상의 안전한 비밀번호를 권장합니다.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-black uppercase tracking-widest text-stone-400 dark:text-primary-400 mb-3 ml-1"
                >
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    가입 진행 중...
                  </span>
                ) : (
                  <>
                    회원가입하기
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <>
              <div className="mt-8 text-center">
                <p className="text-stone-500 dark:text-primary-400 text-sm font-bold">
                  이미 계정이 있으신가요?{" "}
                  <a
                    href="/login"
                    className="text-primary-600 dark:text-primary-300 hover:underline"
                  >
                    로그인
                  </a>
                </p>
              </div>

              <div className="mt-4 text-center">
                <a
                  href="/"
                  className="text-stone-400 dark:text-primary-500 hover:text-stone-600 dark:hover:text-primary-300 text-sm font-bold transition-colors"
                >
                  ← 홈으로 돌아가기
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
