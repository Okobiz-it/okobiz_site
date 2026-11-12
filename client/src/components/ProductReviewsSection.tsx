"use client";

import React from "react";
import { Star } from "lucide-react";
import { ProductReview } from "@/data/mockData";

interface ProductReviewsSectionProps {
  reviews?: ProductReview[];
}

export default function ProductReviewsSection({ reviews }: ProductReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const productReviews = reviews;
  
  // Guarantee minimum items so track is wider than any 4K screen before duplicating
  const minBaseCount = 8;
  const multiplier = Math.max(2, Math.ceil(minBaseCount / Math.max(1, productReviews.length)));
  const baseReviews = Array.from({ length: multiplier }).flatMap(() => productReviews);
  // Duplicate baseReviews for seamless 100% infinite looping
  const marqueeReviews = [...baseReviews, ...baseReviews];

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0E0F12] border-t border-slate-200 dark:border-gray-800 overflow-hidden transition-colors duration-200">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 mb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 px-3.5 py-1 bg-emerald-100/80 dark:bg-emerald-950/40 rounded-[4px] inline-block mb-3 border border-emerald-300 dark:border-emerald-800/40 shadow-xs">
          Client Success Stories
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Trusted by 150+ Businesses Nationwide
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          Hover over any review to pause the slider and read verified feedback from companies running on okobiz software.
        </p>
      </div>

      {/* Infinite Marquee Slider: Completely intertwined, seamless looping with 0 gap */}
      <div className="relative w-full overflow-hidden py-4 select-none group">
        {/* Subtle Edge Fade Overlays */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 dark:from-[#0E0F12] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 dark:from-[#0E0F12] to-transparent z-20 pointer-events-none" />

        <div
          className="flex w-max items-stretch animate-reviews-track group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${Math.max(35, baseReviews.length * 4.5)}s` }}
        >
          {marqueeReviews.map((rev, index) => (
            <div
              key={index}
              className="w-[300px] sm:w-[380px] shrink-0 mx-3 bg-white dark:bg-[#15171B] border border-slate-200 dark:border-gray-800 hover:border-[#0167D6] dark:hover:border-[#3368B2] rounded-[4px] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Star Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-3.5">
                  {Array.from({ length: Math.max(1, Math.min(5, rev.rating || 5)) }).map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed mb-6 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-slate-100 dark:border-gray-800/80">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  {rev.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                  {rev.designation ? rev.designation : ""}
                  {rev.designation && rev.company ? ", " : ""}
                  {rev.company ? <span className="text-slate-800 dark:text-gray-300 font-semibold">{rev.company}</span> : null}
                  {rev.location ? ` • ${rev.location}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes reviewsTrack {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-reviews-track {
          animation-name: reviewsTrack;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </section>
  );
}

