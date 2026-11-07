import React from "react";
import { Compass, Target, Code2, Smile, HeartHandshake, TrendingUp, Zap } from "lucide-react";

export default function CoreValues() {
  return (
    <section className="py-20 bg-white dark:bg-black border-t border-slate-200/60 dark:border-transparent">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Compass className="w-3.5 h-3.5" /> Our North Star
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            What We Stand For
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-gray-400">
            The core principles guiding how we write code, resolve debates, and support each other every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-[#121317] border border-slate-200 dark:border-gray-800/90 rounded-[4px] p-6 hover:border-[#0167D6] dark:hover:border-[#3368B2]/70 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-[4px] bg-blue-50 dark:bg-blue-500/10 text-[#0167D6] dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Extreme Ownership</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              We take total accountability. From architecting the schema to final production deployment, you treat your feature like your own startup.
            </p>
          </div>

          <div className="bg-white dark:bg-[#121317] border border-slate-200 dark:border-gray-800/90 rounded-[4px] p-6 hover:border-emerald-500/70 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-[4px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">First-Principles Thinking</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              We avoid blindly following hype. We dissect complex system challenges down to their fundamentals and build clean, performant, resilient solutions.
            </p>
          </div>

          <div className="bg-white dark:bg-[#121317] border border-slate-200 dark:border-gray-800/90 rounded-[4px] p-6 hover:border-purple-500/70 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-[4px] bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Smile className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Radical Candor &amp; Humility</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Zero room for egos. We conduct direct, constructive code reviews, celebrate shared milestones, and openly learn from failures without blame.
            </p>
          </div>

          <div className="bg-white dark:bg-[#121317] border border-slate-200 dark:border-gray-800/90 rounded-[4px] p-6 hover:border-amber-500/70 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-[4px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Work-Life Harmony</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              High intensity during work hours, protected evenings and weekends. We believe rested, balanced minds produce the most elegant software.
            </p>
          </div>

          <div className="bg-white dark:bg-[#121317] border border-slate-200 dark:border-gray-800/90 rounded-[4px] p-6 hover:border-teal-500/70 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-[4px] bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Meritocracy Over Hierarchy</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Great ideas win regardless of seniority. Promotion, bonuses, and leadership tracks are awarded strictly on contribution, impact, and peer respect.
            </p>
          </div>

          <div className="bg-white dark:bg-[#121317] border border-slate-200 dark:border-gray-800/90 rounded-[4px] p-6 hover:border-rose-500/70 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-[4px] bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Relentless Craftsmanship</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              We take immense pride in micro-interactions, clean type safety, optimized database indexes, and sub-100ms response times.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

