"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";

interface MyPageClientProps {
  userEmail: string;
  notes: any[];
  highlights: any[];
  bookmarks: any[];
}

type Tab = "all" | "notes" | "highlights" | "bookmarks";

export default function MyPageClient({ userEmail, notes, highlights, bookmarks }: MyPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const stats = [
    { 
      label: "묵상 노트", 
      count: notes.length, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      ), 
      color: "text-primary-600 dark:text-primary-400",
      bgColor: "bg-primary-50 dark:bg-primary-900/30"
    },
    { 
      label: "하이라이트", 
      count: highlights.length, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      ), 
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20"
    },
    { 
      label: "북마크", 
      count: bookmarks.length, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
      ), 
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      {/* 프로필 및 통계 헤더 */}
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-paper-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 border border-stone-200 dark:border-primary-800">
              Personal Archive
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary-900 dark:text-primary-50 tracking-tight">
              {userEmail.split('@')[0]}<span className="font-light text-stone-400 dark:text-primary-600">님의 서재</span>
            </h1>
            <p className="text-stone-500 dark:text-primary-400 font-medium mt-2 text-lg">
              말씀 안에서 쌓아온 소중한 기록들입니다.
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-primary-900 p-6 rounded-[2rem] border border-stone-100 dark:border-primary-800 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all">
              <div className={`w-12 h-12 ${stat.bgColor} ${stat.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {stat.icon}
              </div>
              <span className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.count}</span>
              <span className="text-xs font-bold text-stone-400 dark:text-primary-500 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="flex justify-center">
        <Tabs
          tabs={[
            { id: "all", label: "전체 보기" },
            { id: "notes", label: "묵상 노트" },
            { id: "highlights", label: "하이라이트" },
            { id: "bookmarks", label: "북마크" },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as Tab)}
          variant="contained"
          className="border border-stone-200 dark:border-primary-800"
        />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="space-y-16 min-h-[400px]">
        {(activeTab === "all" || activeTab === "notes") && (
          <Section 
            title="묵상 노트" 
            items={notes} 
            type="note" 
            emptyMsg="작성된 노트가 없습니다." 
            isVisible={activeTab === "all" ? notes.length > 0 : true}
          />
        )}
        
        {(activeTab === "all" || activeTab === "highlights") && (
          <Section 
            title="하이라이트" 
            items={highlights} 
            type="highlight" 
            emptyMsg="하이라이트한 구절이 없습니다." 
            isVisible={activeTab === "all" ? highlights.length > 0 : true}
          />
        )}

        {(activeTab === "all" || activeTab === "bookmarks") && (
          <Section 
            title="북마크" 
            items={bookmarks} 
            type="bookmark" 
            emptyMsg="북마크한 구절이 없습니다." 
            isVisible={activeTab === "all" ? bookmarks.length > 0 : true}
          />
        )}

        {/* 전체 탭이고 데이터가 하나도 없을 때 */}
        {activeTab === "all" && notes.length === 0 && highlights.length === 0 && bookmarks.length === 0 && (
          <div className="text-center py-20 bg-paper-50 dark:bg-primary-900/30 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-primary-800">
            <p className="text-stone-400 dark:text-primary-500 font-bold">아직 기록된 내용이 없습니다.<br/>말씀을 읽으며 나만의 기록을 시작해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  type,
  emptyMsg,
  isVisible
}: {
  title: string;
  items: any[];
  type: "note" | "highlight" | "bookmark";
  emptyMsg: string;
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-black text-primary-900 dark:text-primary-50">{title}</h2>
        <div className="h-px flex-1 bg-stone-200 dark:bg-primary-800"></div>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-stone-400 dark:text-primary-500 font-medium bg-white dark:bg-primary-900 rounded-[2rem] border border-stone-100 dark:border-primary-800">
          {emptyMsg}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} item={item} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ item, type }: { item: any; type: "note" | "highlight" | "bookmark" }) {
  const verseRef = `${item.verses.book} ${item.verses.chapter}:${item.verses.verse}`;
  const link = `/bible/korHRV/${encodeURIComponent(item.verses.book)}/${item.verses.chapter}`;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-primary-900 rounded-[2rem] border border-stone-100 dark:border-primary-800 p-8 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 overflow-hidden">
      
      {/* 카드 상단 장식 (하이라이트인 경우 색상 표시) */}
      {type === "highlight" && (
        <div className={`absolute top-0 left-0 w-full h-1.5 opacity-80 ${
          item.color === 'yellow' ? 'bg-amber-400' : 
          item.color === 'green' ? 'bg-emerald-400' : 
          item.color === 'blue' ? 'bg-sky-400' : 
          item.color === 'red' ? 'bg-rose-400' : 
          item.color === 'purple' ? 'bg-violet-400' : 'bg-stone-300'
        }`} />
      )}

      {/* 헤더: 구절 정보 */}
      <div className="flex items-center justify-between mb-6">
        <span className="px-3 py-1 bg-paper-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-100 dark:border-primary-700">
          {verseRef}
        </span>
        <div className="text-stone-400 dark:text-primary-500 group-hover:text-primary-500 transition-colors">
          {type === "note" ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          ) : type === "highlight" ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          )}
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="flex-1 mb-6">
        {type === "note" ? (
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-stone-100 dark:bg-primary-800 rounded-full"></div>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-stone-600 dark:text-primary-300 font-medium line-clamp-4 pl-4"
              dangerouslySetInnerHTML={{ __html: item.content }} 
            />
          </div>
        ) : (
          <p className="font-bible text-lg text-primary-900 dark:text-primary-100 leading-relaxed line-clamp-3">
            말씀을 확인하려면 아래 버튼을 눌러 이동하세요.
          </p>
        )}
      </div>

      {/* 하단 링크 */}
      <a 
        href={link}
        className="mt-auto pt-4 border-t border-stone-50 dark:border-primary-800 flex items-center justify-between text-xs font-bold text-stone-400 dark:text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors uppercase tracking-wider"
      >
        View Context
        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
      </a>
    </div>
  );
}
