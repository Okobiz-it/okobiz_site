import React from "react";

export default function TalkCta() {
  return (
    <section className="bg-black border-t border-b border-gray-800 py-16 lg:py-24 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <h3 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold uppercase mb-4 tracking-wider">
          🖐️ Hello !
        </h3>

        <h2 className="text-5xl sm:text-7xl lg:text-[100px] leading-tight lg:leading-[105px] text-white font-extrabold uppercase tracking-tight mb-8">
          <div>Let’s Talk</div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#3368B2]">
            with us
          </div>
        </h2>

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-white text-lg sm:text-2xl">
          <a
            href="mailto:info@okobiz.com"
            className="hover:text-[#0167D6] underline underline-offset-8 transition-colors"
          >
            info@okobiz.com
          </a>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <a
            href="tel:+8801973590937"
            className="hover:text-[#0167D6] transition-colors"
          >
            +880 1973-590937
          </a>
        </div>
      </div>
    </section>
  );
}
