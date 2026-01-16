"use client";

import React from "react";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-4 mb-8 ${className}`}>
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-primary-900 dark:text-primary-50">
            {title}
          </h2>
          <div className="h-px flex-1 bg-stone-200 dark:bg-primary-800"></div>
        </div>
        {subtitle && (
          <p className="text-sm font-bold text-stone-500 dark:text-primary-400 mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
