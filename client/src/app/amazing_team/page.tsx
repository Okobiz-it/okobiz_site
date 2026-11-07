"use client";

import React, { useEffect, useState } from "react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import { getTeam } from "@/lib/api";
import { TeamMember } from "@/data/mockData";

export default function AmazingTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    getTeam().then((data) => {
      if (data && data.length > 0) setMembers(data);
    });
  }, []);

  const coreTeam = members.filter((m: any) => m.type !== "advisor");
  const advisors = members.filter((m: any) => m.type === "advisor");

  return (
    <div className="bg-[#F8FAFC] dark:bg-black text-slate-900 dark:text-white min-h-screen">
      <PageBanner
        title="Creative Minds"
        subtitle="Meet the engineers, designers, strategists, and advisors behind okobiz"
      />

      <section className="py-20 md:py-28 bg-white dark:bg-black border-t border-slate-200/60 dark:border-transparent">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          {/* Header section matching uploaded design */}
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="font-bold text-[#0077FF] text-xs sm:text-sm uppercase tracking-widest inline-block mb-3">
              -Our Team-
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-wide mb-4">
              Our Creative Minds
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Get the most of reduction in your teams operating costs for the whole product which creates amazing UI/UX experiences.
            </p>
          </div>

          {/* 3-Column Core Team Grid matching uploaded design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 mb-24">
            {coreTeam.map((member: any, idx) => {
              // Center the 10th member in the 4th row on 3-col desktop layout
              const isTenth = idx === 9;

              return (
                <div
                  key={member._id || idx}
                  className={`bg-white dark:bg-[#15161A] border border-slate-200/90 dark:border-[#24262E] rounded-xl overflow-hidden hover:border-[#3368B2] hover:shadow-[0_12px_36px_rgba(51,104,178,0.15)] dark:hover:shadow-[0_12px_36px_rgba(51,104,178,0.25)] transition-all duration-300 flex flex-col justify-between group shadow-sm ${
                    isTenth ? "md:col-start-2" : ""
                  }`}
                >
                  {/* Photo area */}
                  <div className="h-[360px] sm:h-[390px] w-full bg-gradient-to-b from-slate-100 via-slate-100/90 to-slate-200/60 dark:from-[#101115] dark:to-[#15161A] overflow-hidden flex items-end justify-center relative p-2 border-b border-slate-100 dark:border-transparent">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-contain object-bottom group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                    />
                  </div>

                  {/* Name and Designation matching uploaded design */}
                  <div className="p-6 text-center bg-white dark:bg-[#15161A]">
                    <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base uppercase tracking-wider mb-1.5">
                      {member.name}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#B47818] dark:text-[#E2BC72] font-semibold tracking-wide">
                      {member.designation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legal Advisors Section */}
          {advisors.length > 0 && (
            <div className="pt-16 border-t border-slate-200 dark:border-gray-900">
              <div className="text-center mb-12">
                <span className="font-bold text-[#0077FF] text-xs uppercase tracking-widest inline-block mb-2">
                  -ADVISORS-
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Legal & Strategic Advisors
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-6 lg:gap-8">
                {advisors.map((advisor: any, idx) => (
                  <div
                    key={advisor._id || idx}
                    className="bg-white dark:bg-[#15161A] border border-slate-200/90 dark:border-[#24262E] rounded-xl overflow-hidden hover:border-[#3368B2] transition-all duration-300 shadow-sm hover:shadow-lg group"
                  >
                    <div className="h-72 w-full bg-gradient-to-b from-slate-100 via-slate-100/90 to-slate-200/60 dark:from-[#101115] dark:to-[#15161A] overflow-hidden flex items-end justify-center p-2 border-b border-slate-100 dark:border-transparent">
                      <img
                        src={advisor.image}
                        alt={advisor.name}
                        className="w-full h-full object-contain object-bottom group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 text-center bg-white dark:bg-[#15161A]">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-1.5">
                        {advisor.name}
                      </h4>
                      <p className="text-xs text-[#B47818] dark:text-[#E2BC72] font-semibold tracking-wide">
                        {advisor.designation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <TalkCta />
    </div>
  );
}
