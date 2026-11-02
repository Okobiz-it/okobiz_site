"use client";

import React from "react";

export interface SectionLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Default spinning loader for when a particular section on a page loads.
 */
export default function SectionLoader({
  className = "",
  size = "md"
}: SectionLoaderProps) {
  const sizeStyles = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-10 h-10 border-[3px]"
  }[size];

  return (
    <div
      className={`py-12 sm:py-16 flex items-center justify-center w-full select-none ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading section"
    >
      <div
        className={`${sizeStyles} border-[#0167D6] border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}

