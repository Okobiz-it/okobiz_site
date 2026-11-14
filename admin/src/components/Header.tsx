"use client";
import React from "react";
import { Menu, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { getClientUrl } from "@/lib/clientUrl";

interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export default function Header({
  onMenuToggle,
  title
}: HeaderProps) {
  const clientUrl = getClientUrl();

  return (
    <header className="h-16 bg-white dark:bg-[#111216] border-b border-slate-200 dark:border-gray-800/80 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 transition-colors duration-200">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu toggle drawer (lg:hidden) */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-[4px] text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
            title="Open Navigation"
            aria-label="Open Navigation"
          >
            <Menu size={20} />
          </button>
        )}

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize">
          {title || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Mode Toggle (Light/Dark) */}
        <ThemeToggle />

        {/* Live site link */}
        <a
          href={clientUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-slate-100 hover:bg-[#0167D6] hover:text-white text-slate-700 dark:bg-[#181A1F] dark:hover:bg-[#3368B2] dark:text-gray-300 dark:hover:text-white border border-slate-300 dark:border-gray-800 text-xs font-semibold transition duration-150"
        >
          <span>Live Site</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
