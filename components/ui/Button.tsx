"use client";

import React from "react";

export type ButtonVariant = "primary" | "secondary" | "tab" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  variant = "primary",
  size = "md",
  active = false,
  disabled = false,
  loading = false,
  children,
  onClick,
  className = "",
  icon,
  type = "button",
}: ButtonProps) {
  // 기본 스타일
  const baseStyles =
    "font-bold transition-all duration-300 inline-flex items-center justify-center gap-2";

  // Variant별 스타일
  const variantStyles = {
    primary:
      "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-2xl shadow-xl shadow-primary-500/20 active:scale-[0.98]",
    secondary:
      "text-stone-500 dark:text-primary-400 hover:bg-stone-100 dark:hover:bg-primary-800 rounded-xl border border-stone-200 dark:border-primary-800",
    tab: "px-6 py-3 rounded-full transition-all",
    icon: "rounded-xl border border-stone-200 dark:border-primary-800 hover:bg-stone-50 dark:hover:bg-primary-900 transition-colors",
  };

  // Tab variant 활성/비활성 스타일
  const tabActiveStyles = active
    ? "bg-primary-600 dark:bg-primary-700 text-white shadow-lg shadow-primary-500/30"
    : "bg-white dark:bg-primary-900 text-stone-500 dark:text-primary-300 hover:bg-stone-50 dark:hover:bg-primary-800";

  // Icon variant 크기
  const iconSizeStyles = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  // 일반 버튼 크기
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  // Disabled 스타일
  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

  // 최종 클래스 조합
  const getButtonClasses = () => {
    const classes = [baseStyles];

    // Variant에 따른 스타일
    if (variant === "tab") {
      classes.push(tabActiveStyles);
    } else if (variant === "icon") {
      classes.push(variantStyles.icon);
      classes.push(iconSizeStyles[size]);
    } else {
      classes.push(variantStyles[variant]);
      classes.push(sizeStyles[size]);
    }

    // Disabled 스타일
    if (disabled || loading) {
      classes.push(disabledStyles);
    }

    // 커스텀 클래스
    if (className) {
      classes.push(className);
    }

    return classes.join(" ");
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={getButtonClasses()}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
}
