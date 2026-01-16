"use client";

import React from "react";

export type SkeletonRounded = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: SkeletonRounded;
  className?: string;
}

export default function Skeleton({
  width = "100%",
  height = "20px",
  rounded = "lg",
  className = "",
}: SkeletonProps) {
  // Rounded 스타일
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div
      style={{ width, height }}
      className={`bg-stone-200 dark:bg-primary-900 animate-pulse ${roundedClasses[rounded]} ${className}`}
    />
  );
}
