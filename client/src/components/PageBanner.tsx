import React from "react";

interface PageBannerProps {
  title: string;
  className?: string;
  subtitle?: string;
}

export default function PageBanner({ title, className = "", subtitle }: PageBannerProps) {
  return (
    <section
      style={{ backgroundImage: "url('/assets/sub-banner-DifPcO04.webp')" }}
      className={`page-banner bg-cover bg-no-repeat bg-bottom relative h-48 sm:h-56 md:h-64 lg:h-80 flex items-center justify-center border-b border-slate-200 dark:border-gray-800 transition-colors ${className}`}
    >
      {/* Light-mode bright luminous white overlay; dark-mode deep cinema backdrop */}
      <div className="absolute inset-0 bg-white/92 dark:bg-black/85 backdrop-blur-[2px] transition-colors" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-slate-100/90 dark:hidden pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-wider uppercase text-slate-900 dark:text-white drop-shadow-xs dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] transition-colors">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm sm:text-base font-medium text-slate-600 dark:text-slate-200 max-w-2xl mx-auto drop-shadow-xs dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] transition-colors">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
