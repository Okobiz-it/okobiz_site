import React, { forwardRef } from "react";
import { Sparkles, DollarSign, Laptop, GraduationCap, HeartHandshake, Check } from "lucide-react";

const WorkplaceBenefits = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section id="life-at-okobiz" ref={ref} className="py-20 bg-gradient-to-b from-black via-[#08090d] to-black border-b border-gray-800/80">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Workplace &amp; Benefits
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            Built Around <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#3368B2]">
              How You Live &amp; Grow
            </span>
          </h2>
          <p className="mt-4 text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed">
            We provide the compensation, top-tier developer gear, and environment you need to do world-class work while maintaining a healthy personal life.
          </p>
        </div>

        {/* 4 Focused, Meaningful Benefit Pillars (On-site & Professional Excellence) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Benefit 1 */}
          <div className="bg-[#121316] border border-gray-800 rounded-[4px] p-6 hover:border-[#3368B2]/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-[4px] bg-[#3368B2]/15 text-[#3368B2] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Transparent Compensation</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Market-leading salaries, semi-annual performance reviews, and 2 guaranteed full-month festival bonuses (Eid-ul-Fitr &amp; Eid-ul-Adha).
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-800/80 text-[11px] text-[#3368B2] font-semibold flex items-center gap-1">
              <span>Fair, predictable rewards</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Benefit 2: High-Spec Workstation Gear & Ergonomics (No remote/hybrid promotion) */}
          <div className="bg-[#121316] border border-gray-800 rounded-[4px] p-6 hover:border-emerald-500/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-[4px] bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Laptop className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Premium Tech &amp; Workstations</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                High-performance Apple MacBook Pro or multi-core 32GB+ RAM workstations, dual 4K external monitors, ergonomic setup, and all premium licenses.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>First-class developer gear</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="bg-[#121316] border border-gray-800 rounded-[4px] p-6 hover:border-purple-500/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-[4px] bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Learning &amp; Growth</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Fully sponsored technical certifications (AWS, Next.js, GCP), internal weekly tech labs, peer code reviews, and career advancement paths.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-800/80 text-[11px] text-purple-400 font-semibold flex items-center gap-1">
              <span>Continuous mastery</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="bg-[#121316] border border-gray-800 rounded-[4px] p-6 hover:border-amber-500/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-[4px] bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Community &amp; Well-being</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Subsidized daily lunch, artisan coffee and refreshments, annual team retreats, and high respect for your personal evenings and family time.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-800/80 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <span>Rested minds build better</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

WorkplaceBenefits.displayName = "WorkplaceBenefits";
export default WorkplaceBenefits;

