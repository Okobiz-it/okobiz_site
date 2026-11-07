"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

const CAREER_FAQS = [
  {
    q: "Where is the okobiz engineering office located?",
    a: "Our headquarters is located at Mirpur, Dhaka 1216, easily accessible via metro and main transit lines. We operate on-site from our modern engineering hub, equipped with high-spec workstations, collaborative project spaces, and high-speed enterprise connectivity."
  },
  {
    q: "How do festival bonuses and annual performance reviews work?",
    a: "We guarantee 2 full-month festival bonuses per year (disbursed ahead of Eid-ul-Fitr and Eid-ul-Adha) for all confirmed members. In addition, we conduct structured semi-annual and annual performance reviews with transparent salary increments and project milestone incentives."
  },
  {
    q: "What does the technical interview look like at okobiz?",
    a: "We strictly avoid algorithmic trick questions or arbitrary whiteboard trivia. Our technical round is a practical, conversational code and architecture discussion based on your real experience, your portfolio, and how you design scalable systems in production."
  },
  {
    q: "What career growth and promotion opportunities are available at okobiz?",
    a: "We practice structured, merit-based career progression. Every team member has transparent promotion criteria, biannual performance evaluations, access to sponsored technical certifications, and clear pathways to advance into tech lead, architecture, or engineering management roles."
  },
  {
    q: "Can I apply if I don't meet 100% of the listed job requirements?",
    a: "Absolutely. We hire for hunger, aptitude, and problem-solving velocity rather than rigid checklist matches. If you are passionate about high-quality code and eager to master modern web architecture, we want to hear from you."
  }
];

export default function CareerFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => (prev === idx ? null : idx));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-black dark:via-[#06080b] dark:to-black border-t border-slate-200 dark:border-gray-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-blue-500/10 border border-blue-500/30 text-[#0167D6] dark:text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Clarity &amp; Transparency
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Frequently Asked <span className="text-[#0167D6] dark:text-[#3368B2]">Questions</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-gray-400">
            Everything you need to know about joining okobiz, our workspace, and our interview philosophy.
          </p>
        </div>

        <div className="space-y-3">
          {CAREER_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-gray-800 rounded-[4px] overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <span className="text-xs text-[#0167D6] dark:text-[#3368B2] font-mono">0{idx + 1}.</span>
                    <span>{faq.q}</span>
                  </span>
                  <div className="w-7 h-7 rounded-[4px] bg-slate-100 dark:bg-[#181A1D] border border-slate-300 dark:border-gray-800 flex items-center justify-center text-slate-600 dark:text-gray-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#0167D6] dark:text-[#3368B2]" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed border-t border-slate-200 dark:border-gray-800/60 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Recruitment Contact Box */}
        <div className="mt-10 p-5 bg-white dark:bg-[#121316] border border-slate-200 dark:border-gray-800 rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-[4px] bg-blue-50 dark:bg-[#3368B2]/15 text-[#0167D6] dark:text-[#3368B2] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Have a specific question?</h4>
              <p className="text-xs text-slate-600 dark:text-gray-400">Our talent team responds to prospective applicants within 24 hours.</p>
            </div>
          </div>
          <a
            href="mailto:career@okobiz.com"
            className="px-5 py-2.5 bg-[#0167D6] hover:bg-blue-600 !text-white text-white text-white-always text-xs font-bold rounded-[4px] transition-all whitespace-nowrap shadow-md shadow-blue-500/20 inline-flex items-center justify-center cursor-pointer"
          >
            Email Talent Acquisition
          </a>
        </div>
      </div>
    </section>
  );
}

