"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder with same dimensions to avoid layout shift
    return (
      <div className={`w-9 h-9 rounded-[4px] border border-gray-800/80 bg-white/5 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-[4px] border transition-all duration-300 cursor-pointer ${
        isDark
          ? "bg-[#181A1D] border-gray-800 text-amber-400 hover:text-amber-300 hover:border-amber-400/40 hover:bg-amber-400/10 shadow-sm"
          : "bg-white border-slate-200 text-slate-700 hover:text-[#3368B2] hover:border-[#3368B2]/40 hover:bg-slate-50 shadow-sm"
      } ${className}`}
    >
      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 -rotate-12 scale-100" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

