"use client";

import React from "react";

export interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Label({
  htmlFor,
  required = false,
  children,
  className = "",
}: LabelProps) {
  // 기본 스타일
  const baseStyles =
    "block text-xs font-black uppercase tracking-widest text-stone-400 dark:text-primary-400 mb-3 ml-1";

  // 최종 클래스 조합
  const getClasses = () => {
    const classes = [baseStyles];

    if (className) {
      classes.push(className);
    }

    return classes.join(" ");
  };

  return (
    <label htmlFor={htmlFor} className={getClasses()}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
