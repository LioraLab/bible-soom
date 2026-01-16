"use client";

import React from "react";
import { HIGHLIGHT_COLORS } from "@/lib/constants";

export interface ColorOption {
  name: string;
  color: string;
  class: string;
}

export interface ColorPickerProps {
  colors?: readonly ColorOption[];
  onSelect: (color: string) => void;
  columns?: number;
  className?: string;
}

export default function ColorPicker({
  colors = HIGHLIGHT_COLORS,
  onSelect,
  columns = 3,
  className = "",
}: ColorPickerProps) {
  const gridClasses = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    6: "grid-cols-6",
  };

  return (
    <div
      className={`grid ${gridClasses[columns as keyof typeof gridClasses] || "grid-cols-3"} gap-2 ${className}`}
    >
      {colors.map((colorOption) => (
        <button
          key={colorOption.color}
          onClick={() => onSelect(colorOption.color)}
          className={`w-10 h-10 ${colorOption.class} rounded-full hover:scale-110 active:scale-95 transition-transform shadow-sm hover:shadow-md`}
          title={colorOption.name}
          aria-label={colorOption.name}
        />
      ))}
    </div>
  );
}
