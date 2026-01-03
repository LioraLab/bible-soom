import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import ThemeToggle from "@/components/theme/theme-toggle";
import { AuthProvider } from "@/components/auth/auth-provider";
import Header from "@/components/header/header";

export const metadata: Metadata = {
  title: "Bible Soom | 말씀의 흐름 속으로",
  description: "크리스천을 위한 성경 묵상 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <AuthProvider>
            {/* 테마 토글 버튼 (고정 위치) */}
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>

            <Header />

            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
