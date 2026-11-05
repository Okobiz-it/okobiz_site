import React from "react";
import { Code2, Laptop, Target, Users } from "lucide-react";

export default function EngineeringCulture() {
  return (
    <section className="py-16 sm:py-20 bg-black border-t border-b border-gray-900">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Visual Column: Team Collaboration Image */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="w-full overflow-hidden rounded-[4px] group">
              <img
                src="/assets/about-BPfvng5e.webp"
                alt="okobiz Team Collaboration"
                className="w-full h-auto object-contain group-hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Narrative Column: Clear & Meaningful Team Purpose */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#3368B2]/15 text-[#3368B2] border border-[#3368B2]/30 text-xs font-bold uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5" />
                <span>Engineering Culture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                Where Craftsmanship Meets Real Autonomy
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                We build high-performance software, cloud infrastructure, and modern digital platforms. We believe great engineering happens when talented individuals are trusted with ownership, provided top-tier tools, and empowered to solve problems directly.
              </p>
            </div>

            {/* 3 Meaningful Culture Highlights */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-[#121316] border border-gray-800 rounded-[4px] flex items-start gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#3368B2]/20 text-[#3368B2] flex items-center justify-center shrink-0 mt-0.5">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Modern Tech Stack</h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                    TypeScript, Next.js, React, Node.js, PostgreSQL, Docker, and Cloud-native architectures with strict code craftsmanship.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#121316] border border-gray-800 rounded-[4px] flex items-start gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Full Technical Ownership</h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                    No red tape or micromanagement. You select modern toolsets, craft architecture, and ship directly to staging and production.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#121316] border border-gray-800 rounded-[4px] flex items-start gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Collaborative &amp; Supportive</h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                    Work alongside supportive teammates with constructive code reviews, mutual respect, and continuous knowledge-sharing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

