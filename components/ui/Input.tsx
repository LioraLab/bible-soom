"use client";

import React from "react";

export type InputType = "text" | "email" | "password" | "search";

export interface InputProps {
  type?: InputType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
}

export default function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  icon,
  className = "",
  id,
  name,
}: InputProps) {
  // 기본 스타일
  const baseStyles =
    "w-full px-5 py-4 rounded-2xl border transition-all font-medium bg-paper-50 dark:bg-primary-950 text-primary-900 dark:text-primary-50 placeholder-stone-400 dark:placeholder-primary-700 focus:outline-none focus:ring-2";

  // 상태별 스타일
  const normalStyles =
    "border-stone-200 dark:border-primary-800 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-600";
  const errorStyles =
    "border-red-500 dark:border-red-600 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-600";
  const disabledStyles = "opacity-50 cursor-not-allowed";

  // 아이콘이 있을 때 패딩 조정
  const withIconStyles = icon ? "pl-12" : "";

  // 최종 클래스 조합
  const getInputClasses = () => {
    const classes = [baseStyles];

    if (error) {
      classes.push(errorStyles);
    } else {
      classes.push(normalStyles);
    }

    if (disabled) {
      classes.push(disabledStyles);
    }

    if (withIconStyles) {
      classes.push(withIconStyles);
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(" ");
  };

  return (
    <div className="relative w-full">
      {/* 아이콘 */}
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-primary-600 pointer-events-none">
          {icon}
        </div>
      )}

      {/* 입력 필드 */}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={getInputClasses()}
      />

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-2 text-sm font-bold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
