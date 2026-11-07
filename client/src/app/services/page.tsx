import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import { getServices, ServiceClientItem } from "@/lib/api";
import { cleanSnippet } from "@/lib/richText";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services - okobiz",
  description:
    "okobiz is a full-service digital agency specializing in website services, digital media, and graphic content. We offer comprehensive web design and development, app development, and custom logo creation.",
  keywords: [
    "website services",
    "digital media",
    "web development",
    "apps development",
    "seo services",
    "digital marketing",
    "ecommerce solutions",
  ],
};

export default async function ServicesPage() {
  const services: ServiceClientItem[] = await getServices();

  return (
    <section className="bg-white dark:bg-black text-slate-900 dark:text-white min-h-screen">
      {/* Hero Banner */}
      <PageBanner title="Our Services" />

      {/* Services Grid Section */}
      <section
        className="py-14 sm:py-14 md:py-16 lg:py-20 bg-no-repeat bg-left-top bg-slate-50 dark:bg-black"
        style={{ backgroundImage: "url('/assets/pattern-img1-DvcDl20m.webp')" }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="text-center py-10">
            <span
              className="font-bold px-5 py-2 mb-3 inline-block text-[#0167D6] bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/40 rounded-[4px]"
            >
              -What We Offer-
            </span>
            <h3 className="text-slate-900 dark:text-white font-bold text-[34px]">Our Best Solution</h3>
            <p className="para mb-0 text-slate-600 dark:text-gray-400">
              Get the most of reduction in your teams operating costs for the whole product which creates{" "}
              <br className="hidden sm:inline" /> amazing UI/UX experiences.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-y-8 sm:gap-y-8 gap-x-0 sm:gap-x-8">
            {services.map((item, idx) => {
              const detailUrl = `/services/${item.slug}`;
              const snippet = cleanSnippet(item.shortDesc || item.fullDesc, 220);

              return (
                <div key={item._id || idx} className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 group">
                  <div className="pt-10 px-8 pb-7 flex flex-col justify-between bg-white dark:bg-[#181A1D] shadow-sm border border-slate-200 dark:border-gray-800/60 group-hover:border-[#0167D6] group-hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 h-full rounded-[4px]">
                    {/* Clickable Card Body linking to Details Page */}
                    <Link
                      href={detailUrl}
                      className="block group/link cursor-pointer focus:outline-none"
                    >
                      <figure className="w-32 h-32 cardv2 rounded-[4px] transition-transform duration-300 group-hover/link:scale-105">
                        <img
                          className="w-full h-full object-contain"
                          src={item.image || "/assets/website-app-DOXr3sR7.webp"}
                          alt={item.title}
                        />
                      </figure>
                      <div className="mt-4">
                        <h2 className="capitalize text-base font-bold text-slate-900 dark:text-white group-hover/link:text-[#0167d6] transition-colors line-clamp-2 min-h-[3rem] max-h-[3rem] overflow-hidden text-ellipsis">
                          {item.title}
                        </h2>
                        {/* Limited amount of text as shown on the box */}
                        <p className="text-justify font-normal text-sm mt-4 text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-4 min-h-[5.5rem] max-h-[5.5rem] overflow-hidden text-ellipsis">
                          {snippet}
                        </p>
                      </div>
                    </Link>

                    {/* Action Bar with Blue Accent Line */}
                    <div className="mt-6 pt-4 border-t-2 border-[#0167D6] flex flex-col gap-3">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://wa.me/8801973590937?text=${encodeURIComponent(`Query for ${item.title}`)}`}
                        className="block group/btn"
                      >
                        <span className="w-full relative inline-flex items-center justify-center bg-[#0167D6] hover:bg-[#0055B8] text-white text-sm font-bold tracking-widest uppercase py-3 px-6 rounded-[4px] shadow-sm hover:shadow-md hover:shadow-blue-500/25 transition-all">
                          Hire Us
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Talk With Us CTA */}
      <TalkCta />
    </section>
  );
}
