"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, X, Check, DollarSign } from "lucide-react";
import { ProductFormState, PricingPlanForm } from "./types";
import { Textarea } from "@/components/ui/textarea";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<PricingPlanForm>({
    name: "",
    price: 15000,
    discountPrice: 0,
    period: "/month",
    badge: "",
    description: "",
    featuresText: "Core SaaS Module\nCloud Database Setup\nEmail & Chat Support",
    isPopular: false,
  });

  const handleOpenAdd = () => {
    setDraft({
      name: `Tier ${form.pricingPlans.length + 1}`,
      price: 15000,
      discountPrice: 0,
      period: "/month",
      badge: "",
      description: "",
      featuresText: "Core SaaS Module\nCloud Database Setup\nEmail & Chat Support",
      isPopular: false,
    });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (idx: number) => {
    setDraft({ ...form.pricingPlans[idx] });
    setEditingIndex(idx);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!draft.name.trim()) return;
    if (editingIndex !== null && editingIndex >= 0) {
      Object.keys(draft).forEach((k) => {
        const key = k as keyof PricingPlanForm;
        updatePricingPlan(editingIndex, key, draft[key]);
      });
    } else {
      addPricingPlan();
      // Update the newly added last element
      const newIdx = form.pricingPlans.length;
      setTimeout(() => {
        Object.keys(draft).forEach((k) => {
          const key = k as keyof PricingPlanForm;
          updatePricingPlan(newIdx, key, draft[key]);
        });
      }, 50);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-gray-800">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign size={14} className="text-[#0167D6]" />
            <span>Pricing Packages &amp; Plans ({form.pricingPlans.length})</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
            Define pricing tiers, setup charges, or monthly subscriptions for this product.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Tier Plan</span>
        </button>
      </div>

      {form.pricingPlans.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[4px] bg-slate-50 dark:bg-[#0E0F12]">
          <p className="text-xs text-slate-600 dark:text-gray-400">No pricing plans defined yet.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 bg-[#0167D6] hover:bg-blue-700 text-white text-xs font-bold rounded-[4px] cursor-pointer shadow-xs"
          >
            Add Starter Pricing Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {form.pricingPlans.map((plan, idx) => {
            const featuresCount = plan.featuresText
              ? plan.featuresText.split("\n").filter((f) => f.trim().length > 0).length
              : 0;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-[4px] border flex flex-col justify-between transition shadow-2xs ${
                  plan.isPopular
                    ? "border-[#0167D6] bg-blue-50/25 dark:bg-blue-950/20 ring-1 ring-blue-500/30"
                    : "border-slate-200 dark:border-gray-800 bg-white dark:bg-[#15171B]"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                      Tier #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      {plan.badge && (
                        <span className="px-2 py-0.5 rounded-[3px] bg-purple-600 text-white text-[9.5px] font-bold">
                          {plan.badge}
                        </span>
                      )}
                      {plan.isPopular && (
                        <span className="px-2 py-0.5 rounded-[3px] bg-amber-500 text-white text-[9.5px] font-bold">
                          POPULAR
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {plan.name || "Untitled Tier"}
                  </h4>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-[#0167D6] font-mono">
                      ৳ {Number(plan.price || 0).toLocaleString("en-IN")}
                    </span>
                    {plan.discountPrice ? (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ৳ {Number(plan.discountPrice).toLocaleString("en-IN")}
                      </span>
                    ) : null}
                    {plan.period && (
                      <span className="text-[10.5px] text-slate-500 dark:text-gray-400 truncate">
                        ({plan.period})
                      </span>
                    )}
                  </div>

                  {plan.description && (
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-1">
                      {plan.description}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-600 dark:text-gray-400 font-medium pt-1 flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-500" />
                    <span>{featuresCount} Features Listed</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(idx)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-slate-100 dark:bg-white/5 hover:bg-[#0167D6] hover:text-white text-slate-700 dark:text-gray-300 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-transparent transition cursor-pointer"
                    title="Edit Package"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removePricingPlan(idx)}
                    className="p-1 rounded-[4px] text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pricing Plan Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-lg shadow-2xl flex flex-col max-h-[90vh] cursor-default overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#0167D6]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {editingIndex !== null ? "Edit Plan Tier" : "Add Plan Tier"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Starter, Pro, Enterprise"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#0167D6]"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Billing Cycle / Duration
                  </label>
                  <input
                    type="text"
                    placeholder="One-Time Setup, /month, /year"
                    value={draft.period}
                    onChange={(e) => setDraft({ ...draft, period: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#0167D6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Price (BDT) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="15000"
                    value={draft.price || ""}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#0167D6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Regular / Strike Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20000"
                    value={draft.discountPrice || ""}
                    onChange={(e) => setDraft({ ...draft, discountPrice: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#0167D6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Badge Tag Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best Value, Recommended"
                    value={draft.badge || ""}
                    onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.isPopular)}
                      onChange={(e) => setDraft({ ...draft, isPopular: e.target.checked })}
                      className="rounded text-[#0167D6] focus:ring-0"
                    />
                    <span>Highlight as &ldquo;POPULAR&rdquo; Tier</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Short Plan Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Target audience or package overview"
                  value={draft.description || ""}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Included Features (1 per line)
                </label>
                <Textarea
                  rows={3}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  value={draft.featuresText}
                  onChange={(e) => setDraft({ ...draft, featuresText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#0167D6]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#101114]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-[4px] bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
