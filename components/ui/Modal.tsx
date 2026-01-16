"use client";

import React, { useEffect, useRef } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: { x: number; y: number }; // 컨텍스트 메뉴용
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  position,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  // 외부 클릭으로 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
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

  // 컨텍스트 메뉴 스타일 (위치 지정)
  const contextMenuStyle = position
    ? {
        position: "fixed" as const,
        top: position.y,
        left: position.x,
        transform: "none",
      }
    : {};

  // 일반 모달 스타일
  const modalClasses = position
    ? // 컨텍스트 메뉴
      "bg-white/95 dark:bg-primary-950/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-stone-200 dark:border-primary-800 min-w-[180px] animate-in fade-in zoom-in duration-200"
    : // 일반 모달
      "bg-white dark:bg-primary-900 rounded-[2.5rem] shadow-2xl border border-stone-200 dark:border-primary-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300";

  return (
    <div className="fixed inset-0 bg-primary-950/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <div
        ref={modalRef}
        style={contextMenuStyle}
        className={`${modalClasses} ${className}`}
      >
        {/* 모달 헤더 (일반 모달만) */}
        {!position && title && (
          <div className="px-8 py-6 bg-paper-50 dark:bg-primary-950 border-b border-stone-200 dark:border-primary-800 rounded-t-[2.5rem] flex items-center justify-between">
            <h3 className="text-xl font-black text-primary-900 dark:text-primary-50">
              {title}
            </h3>
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
        )}

        {/* 모달 내용 */}
        <div className={position ? "p-2" : "p-8"}>{children}</div>
      </div>
    </div>
  );
}
