"use client";

import React from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
}: AlertProps) {
  // Variant별 스타일
  const variantStyles = {
    info: {
      container:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30 text-blue-900 dark:text-blue-100",
      icon: "text-blue-600 dark:text-blue-400",
      iconPath:
        "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    success: {
      container:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-900 dark:text-green-100",
      icon: "text-green-600 dark:text-green-400",
      iconPath:
        "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    warning: {
      container:
        "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/30 text-yellow-900 dark:text-yellow-100",
      icon: "text-yellow-600 dark:text-yellow-400",
      iconPath:
        "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    },
    error: {
      container:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-100",
      icon: "text-red-600 dark:text-red-400",
      iconPath:
        "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`p-4 rounded-2xl border ${styles.container} ${className} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-6 h-6 flex-shrink-0 ${styles.icon}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={styles.iconPath}
          />
        </svg>

        {/* 내용 */}
        <div className="flex-1">
          {title && (
            <h4 className="font-bold text-sm mb-1">{title}</h4>
          )}
          <div className="text-sm font-medium">{children}</div>
        </div>

        {/* 닫기 버튼 */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
