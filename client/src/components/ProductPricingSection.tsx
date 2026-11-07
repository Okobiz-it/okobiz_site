"use client";

import React from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { PricingPlan } from "@/data/mockData";
import { getProductWhatsAppUrl } from "@/lib/api";

interface ProductPricingSectionProps {
  pricingPlans: PricingPlan[];
  productTitle: string;
  whatsappNumber?: string;
}

export default function ProductPricingSection({
  pricingPlans,
  productTitle,
  whatsappNumber
}: ProductPricingSectionProps) {
  if (!pricingPlans || pricingPlans.length === 0) return null;

  return (
    <section className="py-20 bg-[#F4F6F9] dark:bg-[#141416] border-t border-slate-200 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0167D6] dark:text-[#3368B2] px-3.5 py-1 bg-blue-100/70 dark:bg-blue-900/30 rounded-[4px] inline-block mb-3 border border-blue-200 dark:border-blue-800/40">
            Transparent &amp; Predictable Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Choose the Ideal Plan for {productTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            All plans include free cloud deployment, data migration, and dedicated onboarding support. Select a package below to order or chat with our specialists on WhatsApp.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan, idx) => {
            const planWhatsappUrl = getProductWhatsAppUrl(productTitle, whatsappNumber, plan.name);
            const hasDiscount = Boolean(plan.discountPrice && plan.discountPrice > plan.price);
            const savingsPct = hasDiscount
              ? Math.round((((plan.discountPrice || 0) - plan.price) / (plan.discountPrice || 1)) * 100)
              : 0;

            return (
              <div
                key={idx}
                className={`relative rounded-[4px] p-7 flex flex-col justify-between transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-white dark:bg-[#181A1E] border-2 border-[#0167D6] shadow-xl scale-[1.02] z-10"
                    : "bg-white dark:bg-[#111215] border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Popular Ribbon */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0167D6] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-[4px] uppercase tracking-wider shadow-md">
                    ⭐ Most Popular Choice
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {plan.badge && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-[4px] bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-gray-400 min-h-[36px] mb-6">
                    {plan.description || "Comprehensive software features tailored for this business tier."}
                  </p>

                  {/* Pricing block */}
                  <div className="pb-6 mb-6 border-b border-slate-100 dark:border-gray-800/80">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                        ৳{plan.price?.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-slate-400 dark:text-gray-500 line-through">
                          ৳{plan.discountPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500 dark:text-gray-400">
                        {plan.period || "One-Time Setup"}
                      </span>
                      {savingsPct > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-[4px]">
                          Save {savingsPct}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-gray-400 uppercase tracking-wider">
                      Included Features:
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features?.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Order on WhatsApp CTA */}
                <a
                  href={planWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 rounded-[4px] text-xs font-bold transition flex items-center justify-center gap-2 text-center shadow-xs ${
                    plan.isPopular
                      ? "bg-[#0167D6] hover:bg-blue-600 text-white shadow-blue-900/30"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-white border border-slate-200 dark:border-gray-700"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order {plan.name} via WhatsApp</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

