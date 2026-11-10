"use client";

import React from "react";
import { Layers, Quote, Plus, Star, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { ProductFormState, ProductReviewForm } from "./types";

interface ProductDescriptionTabProps {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  addReview: () => void;
  updateReview: (index: number, field: keyof ProductReviewForm, value: any) => void;
  removeReview: (index: number) => void;
}

export default function ProductDescriptionTab({
  form,
  setForm,
  addReview,
  updateReview,
  removeReview,
}: ProductDescriptionTabProps) {
  return (
    <div className="space-y-8">
      {/* Rich Text Description Section */}
      <div className="space-y-2">
        <div>
          <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Layers size={14} className="text-[#0167D6]" /> Complete Product Description *
          </label>
          <p className="text-[11px] text-slate-600 dark:text-gray-400 mb-3">
            Use headings, lists, bold text, blockquotes, and links to present your product professionally to prospective buyers.
          </p>
        </div>
        <RichTextEditor
          value={form.description}
          onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
          placeholder="Write comprehensive product description, system architecture, benefits, and workflows..."
          minHeight="300px"
        />
      </div>

      {/* Reviews Management Section (Client Success Stories) */}
      <div className="pt-6 border-t border-slate-200 dark:border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0E0F12] p-4 rounded-[4px] border border-slate-200 dark:border-gray-800 max-w-3xl">
          <div>
            <div className="flex items-center gap-2">
              <Quote size={16} className="text-[#0167D6]" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Client Reviews & Success Stories ({form.reviews.length})
              </h3>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-0.5">
              These testimonials are rendered directly in the floating review marquee on this product's client page ("Client Success Stories").
            </p>
          </div>

          <button
            type="button"
            onClick={addReview}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold rounded-[4px] transition shrink-0 shadow-md shadow-blue-500/20"
          >
            <Plus size={14} />
            <span>Add Review</span>
          </button>
        </div>

        {form.reviews.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-[#0E0F12] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 space-y-2 max-w-3xl">
            <Quote size={28} className="mx-auto text-slate-400 dark:text-gray-600 mb-1" />
            <p className="text-xs font-semibold text-slate-800 dark:text-gray-300">No client reviews added yet for this product</p>
            <p className="text-[11px] text-slate-500 dark:text-gray-500 max-w-sm mx-auto">
              Click "Add Review" above to showcase real buyer feedback, enterprise testimonials, and verified 5-star ratings.
            </p>
            <button
              type="button"
              onClick={addReview}
              className="mt-2 inline-flex items-center gap-1 text-xs text-[#0167D6] hover:underline font-bold"
            >
              <Plus size={12} /> Add First Review
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {form.reviews.map((rev, revIdx) => (
              <div
                key={revIdx}
                className="bg-slate-50 dark:bg-[#0E0F12] border border-slate-200 dark:border-gray-800 rounded-[4px] p-4 sm:p-5 space-y-3.5 relative group hover:border-slate-300 dark:hover:border-gray-700 transition shadow-xs"
              >
                {/* Card Top: Numbering, Rating Picker, and Delete */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800/80">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-[4px] bg-blue-100 text-[#0167D6] border border-blue-200 dark:bg-[#3368B2]/20 dark:text-[#3368B2] dark:border-[#3368B2]/40 text-xs font-bold flex items-center justify-center">
                      #{revIdx + 1}
                    </span>

                    {/* Star Rating Picker */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-600 dark:text-gray-400 font-semibold mr-1">Rating:</span>
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => updateReview(revIdx, "rating", starVal)}
                          className="p-0.5 text-slate-300 hover:text-amber-500 dark:text-gray-600 dark:hover:text-amber-400 transition"
                          title={`${starVal} Star${starVal > 1 ? "s" : ""}`}
                        >
                          <Star
                            size={14}
                            className={
                              starVal <= (rev.rating || 5)
                                ? "text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400"
                                : "text-slate-300 dark:text-gray-700"
                            }
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 ml-1">
                        {rev.rating || 5}.0
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeReview(revIdx)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition p-1 rounded"
                    title="Delete this review"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline text-[11px]">Remove</span>
                  </button>
                </div>

                {/* Review Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Client Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rafiqul Islam"
                      value={rev.name}
                      onChange={(e) => updateReview(revIdx, "name", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>

                  {/* Designation */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Managing Director / Owner"
                      value={rev.designation}
                      onChange={(e) => updateReview(revIdx, "designation", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>

                  {/* Company / Store */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">Company / Store Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Al-Madina Pharma Care Ltd."
                      value={rev.company}
                      onChange={(e) => updateReview(revIdx, "company", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>

                  {/* Location / City */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka, Bangladesh"
                      value={rev.location}
                      onChange={(e) => updateReview(revIdx, "location", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>

                  {/* Tag / Category */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">
                      Badge Tag (e.g. Pharmacy ERP, Restaurant POS)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pharmacy ERP"
                      value={rev.tag}
                      onChange={(e) => updateReview(revIdx, "tag", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>

                  {/* Testimonial Comment */}
                  <div className="space-y-1 sm:col-span-2 md:col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400">
                      Client Testimonial Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write customer feedback, operational improvements, and impact of your system..."
                      value={rev.comment}
                      onChange={(e) => updateReview(revIdx, "comment", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
