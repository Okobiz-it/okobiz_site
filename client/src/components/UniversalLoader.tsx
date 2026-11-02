"use client";

import React from "react";
import SectionLoader from "./SectionLoader";

export interface UniversalLoaderProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

/**
 * Universal Loader:
 * - When the whole page loads (fullScreen=true), renders the signature <okobiz/> animated loader.
 * - When a particular section on a page loads (fullScreen=false), renders the default spinning loader.
 */
export default function UniversalLoader({
  fullScreen = true,
  size = "md",
  className = ""
}: UniversalLoaderProps) {
  // If not fullScreen, this is a section load -> render the default spinning loader
  if (!fullScreen) {
    return <SectionLoader size={size} className={className} />;
  }

  // Whole page load -> render the <okobiz/> expand and squeeze loader
  const sizeStyles = {
    sm: "text-lg sm:text-xl",
    md: "text-2xl sm:text-4xl",
    lg: "text-3xl sm:text-5xl"
  }[size];

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300 select-none ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <span
        className={`animate-okobiz-tag ${sizeStyles} font-bold text-black tracking-tight leading-none`}
        style={{ willChange: "transform" }}
      >
        &lt;okobiz/&gt;
      </span>
    </div>
  );
}
