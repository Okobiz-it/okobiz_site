import React from "react";
import { Sparkles, Briefcase, Code2, Users, Award, CheckCircle2 } from "lucide-react";

export default function HiringProcess() {
  const steps = [
    {
      step: "01",
      timing: "48 Hours",
      icon: Briefcase,
      title: "Submit Application",
      description: "Quick 2-minute form. We review your portfolio, GitHub, or live projects with attention to genuine craft.",
      color: "emerald"
    },
    {
      step: "02",
      timing: "20 Minutes",
      icon: Users,
      title: "Initial Sync",
      description: "Informal discussion about your background, career aspirations, and what excites you about building at okobiz.",
      color: "blue"
    },
    {
      step: "03",
      timing: "45-60 Mins",
      icon: Code2,
      title: "Technical Discussion",
      description: "Practical code review and architectural problem-solving based on production scenarios. No trick trivia.",
      color: "amber"
    },
    {
      step: "04",
      timing: "30 Minutes",
      icon: Award,
      title: "Leadership Meet",
      description: "Meet our founders and cross-functional guild leads to explore culture fit, ownership, and team chemistry.",
      color: "purple"
    },
    {
      step: "05",
      timing: "2-3 Days",
      icon: CheckCircle2,
      title: "Formal Offer",
      description: "Transparent compensation package, full benefits breakdown, and tailored onboarding roadmap.",
      color: "emerald"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#06080b] via-[#090b10] to-[#06080b] border-t border-b border-gray-800/80">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Transparent Roadmap
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Our 5-Step Hiring <span className="text-[#3368B2]">Process</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-gray-400">
            Fast, respectful, and transparent. We value your time with actionable feedback at every milestone.
          </p>
        </div>

        {/* 5 Connected Step Nodes */}
        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-12 right-12 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 via-amber-500 via-purple-500 to-rose-500 z-0 opacity-40" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="bg-[#141519] border border-gray-800 rounded-[4px] p-5 text-center flex flex-col items-center hover:border-gray-700 transition-all"
                >
                  <div className="w-20 h-20 rounded-[4px] bg-white/5 border-2 border-gray-700 flex items-center justify-center text-white shadow-xl mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#3368B2] mb-1">
                    Step {st.step} • {st.timing}
                  </span>
                  <h4 className="text-sm font-bold text-white mb-2">{st.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{st.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

