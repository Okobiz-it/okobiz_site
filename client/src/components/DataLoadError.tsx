"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface DataLoadErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  minHeight?: string;
}

export default function DataLoadError({
  title = "Data Couldn't Load",
  message = "We were unable to retrieve live data from the server. Please check your connection or try again.",
  onRetry,
  className = "",
  minHeight = "min-h-[340px]",
}: DataLoadErrorProps) {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#141519] border border-slate-200 dark:border-gray-800/80 rounded-[6px] shadow-xs my-6 ${minHeight} ${className}`}
    >
      {/* Exclamation Badge with glow */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/30 dark:border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md shadow-amber-500/10">
          <AlertCircle className="w-8 h-8 stroke-[2.2]" />
        </div>
        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center shadow-xs">
          !
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-5">
        {message}
      </p>

      {/* Retry Action */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

