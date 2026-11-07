"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-[4px] border border-gray-800/80 bg-white/5 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-[4px] border transition-all duration-200 cursor-pointer ${
        isDark
          ? "bg-[#181A1F] border-gray-800 text-amber-400 hover:text-amber-300 hover:border-amber-400/40 hover:bg-amber-400/10"
          : "bg-white border-slate-200 text-slate-700 hover:text-[#3368B2] hover:border-[#3368B2]/40 hover:bg-slate-50 shadow-sm"
      } ${className}`}
    >
      {isDark ? (
        <Sun size={15} className="transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon size={15} className="transition-transform duration-300 -rotate-12 scale-100" />
      )}
    </button>
  );
}

