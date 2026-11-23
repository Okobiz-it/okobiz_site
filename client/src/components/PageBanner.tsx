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
      className={`page-banner bg-cover bg-no-repeat bg-center relative h-40 sm:h-48 md:h-52 flex items-center justify-center border-b border-slate-200/80 dark:border-white/10 transition-colors ${className}`}
    >
      {/* 
        Subtle white-luminous ambient overlay:
        Gives the photographic banner a lighter, slightly frosted white ambient look
        matching the design screenshot, while keeping text sharp and high-contrast.
      */}
      <div className="absolute inset-0 bg-white/60 dark:bg-black/45 backdrop-blur-[0.5px] transition-colors" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-white/20 dark:from-white/10 dark:via-transparent dark:to-white/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-white/15 dark:from-white/10 dark:via-transparent dark:to-white/10 pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-10 sm:pt-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-widest uppercase text-slate-900 dark:text-white drop-shadow-md transition-colors">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 max-w-2xl mx-auto drop-shadow-xs transition-colors">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
