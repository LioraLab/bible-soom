"use client";

import React, { useRef } from "react";

export type TabsVariant = "contained" | "carousel";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: TabsVariant;
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "contained",
  className = "",
}: TabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Contained variant 스타일
  const containedClasses =
    "inline-flex p-1.5 bg-paper-100 dark:bg-primary-900 rounded-2xl";

  // Carousel variant 스타일
  const carouselClasses =
    "flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory";

  // 탭 버튼 스타일
  const getTabClasses = (isActive: boolean) => {
    const baseClasses =
      "px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap";

    if (variant === "contained") {
      return isActive
        ? `${baseClasses} bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-100 shadow-md`
        : `${baseClasses} text-stone-500 dark:text-primary-300 hover:text-primary-600 dark:hover:text-primary-200`;
    } else {
      // carousel
      return isActive
        ? `${baseClasses} bg-primary-600 dark:bg-primary-700 text-white shadow-lg shadow-primary-500/30 snap-center`
        : `${baseClasses} bg-white dark:bg-primary-900 text-stone-500 dark:text-primary-300 hover:bg-stone-50 dark:hover:bg-primary-800 border border-stone-200 dark:border-primary-800 snap-center`;
    }
  };

  return (
    <div
      ref={scrollRef}
      className={`${variant === "contained" ? containedClasses : carouselClasses} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={getTabClasses(isActive)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  isActive
                    ? "bg-primary-500 dark:bg-primary-600 text-white"
                    : "bg-stone-200 dark:bg-primary-800 text-stone-600 dark:text-primary-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
