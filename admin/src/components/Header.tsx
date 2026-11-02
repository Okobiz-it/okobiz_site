"use client";
import React from "react";
import { Menu, ExternalLink, Database } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export default function Header({ onMenuToggle, title }: HeaderProps) {
  return (
    <header className="h-16 bg-[#111216] border-b border-gray-800/80 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-[4px] text-gray-400 hover:text-white hover:bg-white/5"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white capitalize">
          {title || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-3">

        {/* Live site link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#181A1F] hover:bg-[#3368B2] text-gray-300 hover:text-white border border-gray-800 text-xs font-semibold transition duration-150"
        >
          <span>Live Site</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
