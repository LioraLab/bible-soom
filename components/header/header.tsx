"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/ui/Skeleton";

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 dark:border-primary-800 bg-paper-50/80 dark:bg-primary-950/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="group flex items-center space-x-2">
            <div className="text-2xl font-black tracking-tighter text-primary-700 dark:text-primary-200 group-hover:text-primary-500 transition-colors">
              Bible Soom
            </div>
          </a>

          <nav className="flex items-center space-x-1">
            <NavLink href="/books">성경</NavLink>
            <NavLink href="/search">검색</NavLink>
            <NavLink href="/components">컴포넌트</NavLink>
            {user && <NavLink href="/mypage">서재</NavLink>}

            <div className="w-px h-4 bg-stone-300 dark:bg-primary-800 mx-3 hidden sm:block" />

            {loading ? (
              <Skeleton width="80px" height="36px" rounded="xl" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-stone-500 dark:text-primary-400 hidden lg:block">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-xs font-bold bg-stone-100 dark:bg-primary-900 text-stone-600 dark:text-primary-300 rounded-xl hover:bg-stone-200 dark:hover:bg-primary-800 hover:text-stone-800 transition-all"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-primary-300 hover:text-primary-600 dark:hover:text-primary-100 transition-colors"
                >
                  로그인
                </a>
                <a
                  href="/signup"
                  className="px-5 py-2 text-xs font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all active:scale-95"
                >
                  시작하기
                </a>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-4 py-2 text-sm font-bold text-stone-600 dark:text-primary-300 hover:text-primary-700 dark:hover:text-white rounded-xl hover:bg-paper-100 dark:hover:bg-primary-900/50 transition-all"
    >
      {children}
    </a>
  );
}
