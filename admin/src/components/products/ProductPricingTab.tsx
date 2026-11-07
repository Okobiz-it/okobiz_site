"use client";

import React from "react";
import { Plus, Trash } from "lucide-react";
import { ProductFormState, PricingPlanForm } from "./types";

interface ProductPricingTabProps {
  form: ProductFormState;
  addPricingPlan: () => void;
  updatePricingPlan: (index: number, field: keyof PricingPlanForm, value: any) => void;
  removePricingPlan: (index: number) => void;
}

export default function ProductPricingTab({
  form,
  addPricingPlan,
  updatePricingPlan,
  removePricingPlan,
}: ProductPricingTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-gray-800">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Editable Pricing Packages & Feature Comparison
          </h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
            Build lucrative pricing tiers (Starter, Business, Enterprise) with customizable features for each package.
          </p>
        </div>

        <button
          type="button"
          onClick={addPricingPlan}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white text-white-always text-xs font-bold transition shadow shrink-0"
        >
          <Plus size={14} />
          <span>Add Another Pricing Plan</span>
        </button>
      </div>

      {form.pricingPlans.length === 0 ? (
        <div className="p-8 text-center border border-slate-200 dark:border-gray-800 rounded-[4px] bg-slate-50 dark:bg-[#0E0F12]">
          <p className="text-xs text-slate-600 dark:text-gray-400">No pricing plans defined yet.</p>
          <button
            type="button"
            onClick={addPricingPlan}
            className="mt-3 px-4 py-2 bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold rounded-[4px]"
          >
            Add Starter Pricing Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {form.pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-[4px] border bg-slate-50 dark:bg-[#0E0F12] space-y-4 relative ${
                plan.isPopular ? "border-[#0167D6] ring-1 ring-blue-500/30" : "border-slate-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0167D6] dark:bg-blue-900/40 dark:text-[#3368B2] font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    {plan.name || `Plan #${idx + 1}`}
                  </h4>
                  {plan.isPopular && (
                    <span className="text-[10px] bg-blue-100 text-[#0167D6] dark:bg-blue-900/40 dark:text-blue-300 font-bold px-2 py-0.5 rounded">
                      Most Popular
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removePricingPlan(idx)}
                  className="text-slate-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded transition"
                  title="Delete this plan"
                >
                  <Trash size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">Plan Name</label>
                  <input
                    type="text"
                    value={plan.name}
                    placeholder="e.g. Starter Package"
                    onChange={(e) => updatePricingPlan(idx, "name", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">Price (৳ BDT)</label>
                  <input
                    type="number"
                    value={plan.price}
                    placeholder="15000"
                    onChange={(e) => updatePricingPlan(idx, "price", Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">Regular / Discount Price</label>
                  <input
                    type="number"
                    value={plan.discountPrice}
                    placeholder="20000"
                    onChange={(e) =>
                      updatePricingPlan(idx, "discountPrice", Number(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">Billing Cycle / Duration</label>
                  <input
                    type="text"
                    value={plan.period}
                    placeholder="e.g. One-Time Setup, / month"
                    onChange={(e) => updatePricingPlan(idx, "period", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={plan.badge}
                    placeholder="e.g. Single Store, Most Popular, Best Value"
                    onChange={(e) => updatePricingPlan(idx, "badge", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">Short Description</label>
                  <input
                    type="text"
                    value={plan.description}
                    placeholder="e.g. Essential tools for single store retail setup."
                    onChange={(e) => updatePricingPlan(idx, "description", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                  />
                </div>
              </div>

              {/* Features textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400 flex items-center justify-between">
                  <span>Included Features (1 feature per line)</span>
                  <span className="text-[10px] text-slate-500 dark:text-gray-500">Will display as checkmarked items</span>
                </label>
                <textarea
                  rows={3}
                  value={plan.featuresText}
                  placeholder="Single Counter POS Terminal&#10;Unlimited Medicines & Batches&#10;Batch & Expiry Date Tracking&#10;Thermal Receipt Printing"
                  onChange={(e) => updatePricingPlan(idx, "featuresText", e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={plan.isPopular}
                    onChange={(e) => updatePricingPlan(idx, "isPopular", e.target.checked)}
                    className="rounded border-slate-300 text-[#0167D6] focus:ring-0"
                  />
                  <span className="text-xs font-semibold">
                    Highlight this plan as "Most Popular" on sales cards
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
