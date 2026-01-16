"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BackgroundDecoration from "@/components/ui/BackgroundDecoration";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

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
        <BackgroundDecoration variant="blob" position="top-right" />
        <BackgroundDecoration variant="blob" position="bottom-left" className="bg-stone-200 dark:bg-primary-800/10" />
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
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <Alert variant="error">{error}</Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? "로그인 중..." : (
                <>
                  로그인하기
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </Button>
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
