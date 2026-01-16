"use client";

import React from "react";
import Link from "next/link";

export type CardType = "base" | "stat" | "result" | "book";

export interface CardProps {
  type?: CardType;
  children?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  decoration?: boolean;
  hoverable?: boolean;
  className?: string;
  // Stat card props
  icon?: React.ReactNode;
  count?: number | string;
  label?: string;
  bgColor?: string;
  iconColor?: string;
  // Result card props
  badge?: string;
  subtitle?: string;
}

export default function Card({
  type = "base",
  children,
  onClick,
  href,
  decoration = false,
  hoverable = true,
  className = "",
  // Stat props
  icon,
  count,
  label,
  bgColor = "bg-paper-100 dark:bg-paper-900",
  iconColor = "text-primary-600 dark:text-primary-300",
  // Result props
  badge,
  subtitle,
}: CardProps) {
  // 기본 카드 스타일
  const baseCardStyles =
    "block rounded-[2rem] border border-stone-100 dark:border-primary-800 bg-white dark:bg-primary-900 transition-all duration-500";

  // 호버 스타일
  const hoverStyles = hoverable
    ? "hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-2xl hover:shadow-primary-900/5"
    : "";

  // 타입별 스타일
  const typeStyles = {
    base: "p-8",
    stat: "p-6 flex flex-col items-center justify-center text-center",
    result: "p-10 group cursor-pointer",
    book: "p-8 group cursor-pointer relative overflow-hidden",
  };

  // 클릭 가능한지
  const isClickable = onClick || href;

  // 최종 클래스 조합
  const getCardClasses = () => {
    const classes = [baseCardStyles, typeStyles[type]];

    if (hoverable) {
      classes.push(hoverStyles);
    }

    if (isClickable) {
      classes.push("cursor-pointer");
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(" ");
  };

  // Stat Card 렌더링
  const renderStatCard = () => (
    <>
      {icon && (
        <div
          className={`w-12 h-12 ${bgColor} ${iconColor} rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}
        >
          {icon}
        </div>
      )}
      {count !== undefined && (
        <span className="text-3xl font-black text-primary-900 dark:text-primary-50 mb-1">
          {count}
        </span>
      )}
      {label && (
        <span className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-primary-400">
          {label}
        </span>
      )}
      {children}
    </>
  );

  // Result Card 렌더링
  const renderResultCard = () => (
    <>
      {(badge || subtitle) && (
        <div className="flex items-center gap-3 mb-6">
          {badge && (
            <span className="px-3 py-1 bg-paper-50 dark:bg-paper-900 text-primary-600 dark:text-primary-300 text-xs font-bold rounded-lg">
              {badge}
            </span>
          )}
          {subtitle && (
            <span className="text-xs font-bold text-stone-400 dark:text-primary-500">
              {subtitle}
            </span>
          )}
        </div>
      )}
      {children}
      {href && (
        <div className="mt-8 flex items-center text-stone-300 dark:text-primary-600 font-bold text-xs uppercase tracking-wider group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          Go to Chapter{" "}
          <span className="ml-2 group-hover:translate-x-2 transition-transform">
            →
          </span>
        </div>
      )}
    </>
  );

  // Book Card 렌더링 (배경 장식 포함)
  const renderBookCard = () => (
    <>
      {decoration && (
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-paper-200 to-primary-200 dark:from-primary-800 dark:to-primary-900 rounded-full opacity-20 blur-2xl group-hover:scale-125 transition-transform"></div>
      )}
      <div className="relative z-10">{children}</div>
    </>
  );

  // 카드 내용 렌더링
  const renderContent = () => {
    switch (type) {
      case "stat":
        return renderStatCard();
      case "result":
        return renderResultCard();
      case "book":
        return renderBookCard();
      default:
        return children;
    }
  };

  // 링크 카드
  if (href) {
    return (
      <Link href={href} className={getCardClasses()}>
        {renderContent()}
      </Link>
    );
  }

  // 일반 카드
  return (
    <div onClick={onClick} className={getCardClasses()}>
      {renderContent()}
    </div>
  );
}
