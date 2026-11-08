"use client";

import React from "react";
import { Link2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { ProductFormState } from "./types";
import TechnologyIconPicker from "@/components/TechnologyIconPicker";

interface ProductBasicsTabProps {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  slugError: string;
  handleSlugChange: (val: string) => void;
  handleTitleChange: (val: string) => void;
}

export default function ProductBasicsTab({
  form,
  setForm,
  slugError,
  handleSlugChange,
  handleTitleChange,
}: ProductBasicsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Title */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. PharmaCare Pro - Pharmacy Management System"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
          />
        </div>

        {/* Custom Page Slug / URL Input */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Link2 size={13} className="text-[#0167D6]" /> Custom Page Slug <span className="text-red-500">*</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
              Live URL: <span className="text-[#0167D6] dark:text-blue-400 font-bold">/products/{form.slug || "prod-1"}</span>
            </span>
          </label>
          <div
            className={`flex rounded-[4px] overflow-hidden border bg-white dark:bg-[#0E0F12] transition-colors ${
              slugError
                ? "border-red-500 ring-1 ring-red-500/30"
                : "border-slate-300 dark:border-gray-800 focus-within:border-[#0167D6]"
            }`}
          >
            <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-[#17191E] text-slate-600 dark:text-gray-400 text-xs font-mono border-r border-slate-300 dark:border-gray-800 select-none flex items-center shrink-0">
              /products/
            </span>
            <input
              type="text"
              required
              placeholder="prod-1"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-mono focus:outline-none"
            />
          </div>
          {slugError ? (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium mt-1">
              <AlertCircle size={13} className="shrink-0" />
              <span>{slugError}</span>
            </div>
          ) : form.slug ? (
            <p className="text-[11px] text-slate-600 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={12} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>
                Slug is available: <strong className="text-emerald-600 dark:text-emerald-300 font-mono">/products/{form.slug}</strong>
              </span>
            </p>
          ) : (
            <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-0.5">
              Specify page URL slug (e.g. prod-1 or pharmacare-pro). Must be unique across all products.
            </p>
          )}
        </div>

        {/* Tagline */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Tagline / Subheading</label>
          <input
            type="text"
            placeholder="e.g. Complete Cloud Pharmacy & Medical Store POS, Batch Expiry Tracker & Accounting ERP"
            value={form.tagline}
            onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
          >
            <option value="SaaS & ERP">SaaS & ERP</option>
            <option value="Healthcare & Pharmacy">Healthcare & Pharmacy</option>
            <option value="Restaurant & Food">Restaurant & Food</option>
            <option value="Retail & Supermarket">Retail & Supermarket</option>
            <option value="Education & School">Education & School</option>
            <option value="Accounting & Billing">Accounting & Billing</option>
            <option value="Custom">Custom Category...</option>
          </select>
          {form.category === "Custom" && (
            <input
              type="text"
              placeholder="Type custom category name"
              value={form.customCategory}
              onChange={(e) => setForm((prev) => ({ ...prev, customCategory: e.target.value }))}
              className="w-full mt-2 px-3 py-2 bg-white dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white"
            />
          )}
        </div>

        {/* Display Order */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Display Order</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) || 1 }))}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
          />
        </div>

        {/* Live Demo URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center justify-between">
            <span>Live Demo URL (View Live)</span>
            <span className="text-[10px] text-slate-500 dark:text-gray-500">Opens in preview iframe</span>
          </label>
          <input
            type="url"
            placeholder="https://demo.pharmacy.okobiz.com"
            value={form.liveUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, liveUrl: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
          />
        </div>

        {/* WhatsApp Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center justify-between">
            <span>WhatsApp Number (Ask for Demo)</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Direct Click-to-Chat</span>
          </label>
          <input
            type="text"
            placeholder="+8801973590937"
            value={form.whatsappNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
          />
        </div>
      </div>

      {/* Highlights Bullet Points */}
      <div className="space-y-1.5 pt-2">
        <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center justify-between">
          <span>Quick Highlight Bullets (1 per line)</span>
          <span className="text-[10px] text-slate-500 dark:text-gray-400">Shown as checkmark pills on cards</span>
        </label>
        <textarea
          rows={3}
          placeholder="Automated Batch & Expiry Date Alert&#10;Generic Brand Recommendation System&#10;High-Speed Barcode POS Billing"
          value={form.featuresText}
          onChange={(e) => setForm((prev) => ({ ...prev, featuresText: e.target.value }))}
          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] leading-relaxed"
        />
      </div>

      {/* Technology Frameworks & Tools Icon Picker */}
      <div className="pt-2">
        <TechnologyIconPicker
          selected={form.techStack || []}
          onChange={(newStack) =>
            setForm((prev) => ({ ...prev, techStack: newStack }))
          }
          label="Technology Frameworks & Tools"
          helperText="Select technology icons for this SaaS product. Displayed uniformly with the exact same color styling in the product specifications."
        />
      </div>

      {/* Status & Badges Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-gray-800">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0E0F12] p-3 rounded-[4px] border border-slate-200 dark:border-gray-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.status === "active"}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.checked ? "active" : "draft" }))
              }
              className="rounded border-slate-300 text-[#0167D6] focus:ring-0"
            />
            <span>Active & Published</span>
          </label>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0E0F12] p-3 rounded-[4px] border border-slate-200 dark:border-gray-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.popularBadge}
              onChange={(e) => setForm((prev) => ({ ...prev, popularBadge: e.target.checked }))}
              className="rounded border-slate-300 text-[#0167D6] focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> "Popular" Badge
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0E0F12] p-3 rounded-[4px] border border-slate-200 dark:border-gray-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featuredBadge}
              onChange={(e) => setForm((prev) => ({ ...prev, featuredBadge: e.target.checked }))}
              className="rounded border-slate-300 text-[#0167D6] focus:ring-0"
            />
            <span>"Ready SaaS" Badge</span>
          </label>
        </div>
      </div>
    </div>
  );
}
