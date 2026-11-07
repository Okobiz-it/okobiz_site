import React from "react";

export default function TalkCta() {
  return (
    <section className="talk-cta-section bg-slate-50 dark:bg-[#0A1322] border-t border-b border-slate-200 dark:border-gray-800 py-16 lg:py-24 text-center relative overflow-hidden transition-colors">
      <div className="absolute inset-0 bg-radial-gradient from-blue-900/5 dark:from-blue-900/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <h3 className="talk-cta-title text-slate-900 dark:text-white text-xl sm:text-2xl lg:text-3xl font-bold uppercase mb-4 tracking-wider">
          🖐️ Hello !
        </h3>

        <h2 className="text-5xl sm:text-7xl lg:text-[100px] leading-tight lg:leading-[105px] font-extrabold uppercase tracking-tight mb-8">
          <div className="talk-cta-heading text-slate-900 dark:text-white">Let’s Talk</div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#0167D6] via-blue-600 to-[#3368B2] dark:from-blue-400 dark:to-[#3368B2]">
            with us
          </div>
        </h2>

        <div className="talk-cta-contact flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-slate-900 dark:text-white text-lg sm:text-2xl font-bold">
          <a
            href="mailto:info@okobiz.com"
            className="hover:text-[#0167D6] dark:hover:text-blue-400 underline underline-offset-8 transition-colors text-slate-900 dark:text-white"
          >
            info@okobiz.com
          </a>
          <span className="text-slate-400 dark:text-gray-600 hidden sm:inline">|</span>
          <a
            href="tel:+8801973590937"
            className="hover:text-[#0167D6] dark:hover:text-blue-400 transition-colors text-slate-900 dark:text-white"
          >
            +880 1973-590937
          </a>
        </div>
      </div>
    </section>
  );
}
