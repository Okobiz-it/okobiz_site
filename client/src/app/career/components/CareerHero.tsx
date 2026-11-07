"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface CareerHeroProps {
  jobCount: number;
  onScrollToOpenings: () => void;
  onScrollToLife: () => void;
}

export default function CareerHero({
  jobCount,
  onScrollToOpenings,
  onScrollToLife
}: CareerHeroProps) {
  return (
    <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-black dark:via-[#06080c] dark:to-black border-b border-slate-200 dark:border-gray-800/80">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-blue-600/10 via-[#3368B2]/15 to-indigo-600/10 dark:from-blue-600/15 dark:via-[#3368B2]/20 dark:to-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 -right-12 w-80 h-80 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-[1.08]">
          Join Our Crew, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0167D6] via-blue-600 to-[#3368B2] dark:from-blue-400 dark:via-sky-300 dark:to-[#3368B2]">
            Excellence Starts
          </span>{" "}
          With You!
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Are you ready to make your mark? At okobiz, we build scalable web applications, enterprise SaaS architectures, and transformative digital experiences for global clients. Step into an environment where your craft is respected, your voice matters, and your career has no ceiling.
        </p>

        {/* Dual CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onScrollToOpenings}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0167D6] hover:bg-blue-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-[4px] shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Explore Current Openings ({jobCount})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onScrollToLife}
            className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-black/60 hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-500 text-slate-800 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-[4px] shadow-xs transition-all flex items-center justify-center cursor-pointer"
          >
            <span>Life at okobiz</span>
          </button>
        </div>
      </div>
    </section>
  );
}

