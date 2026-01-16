"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BackgroundDecoration from "@/components/ui/BackgroundDecoration";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

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
        <BackgroundDecoration variant="blob" position="top-left" />
        <BackgroundDecoration variant="blob" position="bottom-right" className="bg-primary-100 dark:bg-primary-800/10" />
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
                <p className="mt-2 text-[10px] text-stone-400 dark:text-primary-400 font-bold ml-1">
                  최소 6자 이상의 안전한 비밀번호를 권장합니다.
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
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
                {loading ? "가입 진행 중..." : (
                  <>
                    회원가입하기
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </Button>
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
