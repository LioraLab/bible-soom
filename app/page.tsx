export default function Page() {
  return (
    <main className="min-h-screen">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
            말씀 안에서 숨 쉬다
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            말씀의 흐름 속으로
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            언제 어디서나 성경을 읽고, 묵상하고, 기록하세요
          </p>
        </div>
      </section>

      {/* 메인 기능 그리드 */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 성경 읽기 */}
            <a
              href="/books"
              className="group relative overflow-hidden rounded-2xl border-2 border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-800 p-8 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative z-10">
                <div className="text-4xl mb-4">📖</div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">성경 읽기</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  구약과 신약 66권의 성경을 읽으세요
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent dark:from-indigo-950 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>

            {/* 검색 */}
            <a
              href="/search"
              className="group relative overflow-hidden rounded-2xl border-2 border-green-100 dark:border-green-900 bg-white dark:bg-slate-800 p-8 hover:border-green-300 dark:hover:border-green-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative z-10">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">검색</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  말씀을 검색하고 원하는 구절을 찾으세요
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>

            {/* 마이페이지 */}
            <a
              href="/mypage"
              className="group relative overflow-hidden rounded-2xl border-2 border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-800 p-8 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative z-10">
                <div className="text-4xl mb-4">⭐</div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">마이페이지</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  나의 모든 기록을 한곳에서 관리하세요
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
          </div>
        </div>
      </section>

      {/* 오늘의 말씀 섹션 */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">오늘의 말씀</h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
            <p className="text-xl text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
              "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라"
            </p>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">요한복음 3:16</p>
          </div>
        </div>
      </section>
    </main>
  );
}
