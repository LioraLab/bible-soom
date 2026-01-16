"use client";

import React, { useEffect, useRef } from "react";

export type DrawerPosition = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  width?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  position = "right",
  width = "400px",
  children,
  className = "",
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Escape 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 위치별 스타일
  const positionStyles = {
    left: "left-0 top-0 h-full animate-in slide-in-from-left duration-300",
    right: "right-0 top-0 h-full animate-in slide-in-from-right duration-300",
    top: "top-0 left-0 w-full animate-in slide-in-from-top duration-300",
    bottom:
      "bottom-0 left-0 w-full animate-in slide-in-from-bottom duration-300",
  };

  // 크기 스타일
  const sizeStyle =
    position === "left" || position === "right"
      ? { width }
      : { height: width };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-primary-950/40 dark:bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={sizeStyle}
        className={`fixed bg-white dark:bg-primary-900 shadow-2xl z-50 overflow-y-auto ${positionStyles[position]} ${className}`}
      >
        {/* 닫기 버튼 */}
        <div className="sticky top-0 p-4 bg-paper-50 dark:bg-primary-950 border-b border-stone-200 dark:border-primary-800 flex items-center justify-between">
          <div className="w-10" /> {/* 공간 확보 */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-stone-100 dark:hover:bg-primary-800 transition-colors text-stone-500 dark:text-primary-400"
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">{children}</div>
      </div>
    </>
  );
}
