"use client";

import React from "react";

export type DecorationVariant = "blob" | "gradient" | "corner";
export type DecorationPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface BackgroundDecorationProps {
  variant?: DecorationVariant;
  position?: DecorationPosition;
  className?: string;
}

export default function BackgroundDecoration({
  variant = "blob",
  position = "top-left",
  className = "",
}: BackgroundDecorationProps) {
  // 위치별 스타일
  const positionStyles = {
    "top-left": "top-[-20%] left-[-10%]",
    "top-right": "top-[-10%] right-[-10%]",
    "bottom-left": "bottom-[-10%] left-[-10%]",
    "bottom-right": "bottom-[-10%] right-[-10%]",
  };

  // Variant별 스타일
  const variantStyles = {
    blob: "w-[50%] h-[50%] bg-paper-200 dark:bg-primary-900/20 rounded-full blur-[100px] opacity-60",
    gradient:
      "w-[40%] h-[40%] bg-gradient-to-br from-paper-200 to-primary-200 dark:from-primary-800 dark:to-primary-900 rounded-full blur-[120px] opacity-60",
    corner:
      "w-32 h-32 bg-gradient-to-br from-paper-200 to-primary-200 dark:from-primary-800 dark:to-primary-900 rounded-full opacity-20 blur-2xl",
  };

  return (
    <div
      className={`absolute ${positionStyles[position]} ${variantStyles[variant]} pointer-events-none ${className}`}
    />
  );
}
