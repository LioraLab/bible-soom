"use client";

import React from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "primary",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  // 기본 스타일
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-lg transition-colors";

  // Variant별 스타일
  const variantStyles = {
    primary:
      "bg-paper-50 dark:bg-paper-900 text-primary-600 dark:text-primary-300 border border-paper-200 dark:border-paper-800",
    secondary:
      "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700",
    success:
      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    danger:
      "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  };

  // 크기별 스타일
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  // 최종 클래스 조합
  const getClasses = () => {
    const classes = [baseStyles, variantStyles[variant], sizeStyles[size]];

    if (className) {
      classes.push(className);
    }

    return classes.join(" ");
  };

  return <span className={getClasses()}>{children}</span>;
}
