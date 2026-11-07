"use client";

import React from "react";
import { X, ExternalLink } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function PreviewModal({ isOpen, onClose, url, title }: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full h-[90vh] max-w-6xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-gray-700 rounded-[4px] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-[#1A1A1C] border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base truncate max-w-md">
              {title}
            </h3>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0167D6] hover:underline text-xs font-semibold flex items-center gap-1"
            >
              Open in new tab <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Iframe Content */}
        <div className="flex-1 bg-white relative">
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
