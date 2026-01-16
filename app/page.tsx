import BackgroundDecoration from "@/components/ui/BackgroundDecoration";
import Badge from "@/components/ui/Badge";

export default function Page() {
  return (
    <main className="min-h-screen bg-paper-50 dark:bg-primary-950 transition-colors duration-500">
      {/* 히어로 섹션 */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <BackgroundDecoration variant="blob" position="top-left" />
          <BackgroundDecoration variant="gradient" position="bottom-right" className="w-[40%] h-[40%] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white dark:bg-primary-900 border border-stone-200 dark:border-primary-800 text-primary-600 dark:text-primary-300 text-xs font-bold tracking-widest uppercase shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse"></span>
            Bible Soom
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-primary-800 dark:text-primary-50 mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            말씀의 흐름 <span className="text-primary-500 dark:text-primary-400">속으로</span>
          </h1>
          <p className="text-base md:text-lg text-stone-500 dark:text-primary-300/80 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000">
            복잡한 일상 속에서 잠시 멈추어,<br className="sm:hidden" /> 
            언제 어디서나 성경을 읽고 묵상하며 당신만의 기록을 남겨보세요.
          </p>
        </div>
      </section>

      {/* 메인 기능 그리드 */}
      <section className="py-12 md:py-16 px-6 bg-white dark:bg-primary-950/50 border-y border-stone-100 dark:border-primary-900">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* 성경 읽기 */}
            <a
              href="/books"
              className="group relative overflow-hidden rounded-[2rem] border border-stone-200 dark:border-primary-800 bg-paper-50 dark:bg-primary-900 p-10 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white dark:bg-primary-800 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-stone-100 dark:border-primary-700 text-primary-600 dark:text-primary-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-50 mb-3">성경 읽기</h2>
                <p className="text-stone-500 dark:text-primary-300 leading-relaxed text-sm">
                  구약과 신약 66권의 모든 말씀을<br /> 
                  다양한 번역본과 함께 깊이 있게 읽으세요.
                </p>
                <div className="mt-8 flex items-center text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider">
                  Read Bible <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </a>

            {/* 검색 */}
            <a
              href="/search"
              className="group relative overflow-hidden rounded-[2rem] border border-stone-200 dark:border-primary-800 bg-paper-50 dark:bg-primary-900 p-10 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white dark:bg-primary-800 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-stone-100 dark:border-primary-700 text-primary-600 dark:text-primary-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-50 mb-3">말씀 검색</h2>
                <p className="text-stone-500 dark:text-primary-300 leading-relaxed text-sm">
                  찾고 싶은 말씀이 있나요?<br /> 
                  강력한 검색 기능으로 원하는 구절을 빠르게 찾으세요.
                </p>
                <div className="mt-8 flex items-center text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider">
                  Search <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </a>

            {/* 마이페이지 */}
            <a
              href="/mypage"
              className="group relative overflow-hidden rounded-[2rem] border border-stone-200 dark:border-primary-800 bg-paper-50 dark:bg-primary-900 p-10 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white dark:bg-primary-800 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-stone-100 dark:border-primary-700 text-primary-600 dark:text-primary-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-50 mb-3">나의 서재</h2>
                <p className="text-stone-500 dark:text-primary-300 leading-relaxed text-sm">
                  내가 남긴 모든 메모와 하이라이트,<br /> 
                  소중한 묵상의 흔적들을 한곳에서 관리하세요.
                </p>
                <div className="mt-8 flex items-center text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider">
                  My Library <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 오늘의 말씀 섹션 */}
      <section className="py-24 px-6 bg-paper-100 dark:bg-primary-950">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-xs font-black text-primary-400 dark:text-primary-500 uppercase tracking-[0.3em] mb-12">Today&apos;s Word</h3>
          <div className="relative group">
            {/* 장식 요소 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-200 to-paper-300 dark:from-primary-800 dark:to-primary-700 rounded-[2.5rem] blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
            
            <div className="relative bg-white dark:bg-primary-900 rounded-[2.5rem] p-12 md:p-20 shadow-xl border border-white/50 dark:border-primary-800 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-300 dark:bg-primary-600"></div>
              <p className="font-bible text-2xl md:text-4xl text-primary-900 dark:text-primary-50 leading-[1.8] mb-10 text-balance tracking-tight">
                &quot;하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라&quot;
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-stone-200 dark:bg-primary-700"></div>
                <p className="text-primary-600 dark:text-primary-300 font-black tracking-widest text-sm uppercase">John 3:16</p>
                <div className="h-px w-12 bg-stone-200 dark:bg-primary-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
