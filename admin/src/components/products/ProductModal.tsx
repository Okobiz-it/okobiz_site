"use client";

import React, { useState } from "react";
import {
  Package,
  X,
  Tag,
  ImageIcon,
  Layers,
  DollarSign,
  Loader2,
  Check,
} from "lucide-react";
import {
  ProductFormState,
  ProductTabType,
  PricingPlanForm,
  ProductReviewForm,
} from "./types";
import ProductBasicsTab from "./ProductBasicsTab";
import ProductMediaTab from "./ProductMediaTab";
import ProductDescriptionTab from "./ProductDescriptionTab";
import ProductPricingTab from "./ProductPricingTab";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem: any;
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  saving: boolean;
  slugError: string;
  handleSlugChange: (val: string) => void;
  handleTitleChange: (val: string) => void;
  handleSaveProduct: (e: React.FormEvent) => void;
  uploadingVideo: boolean;
  uploadingMultiImages: boolean;
  handleVideoUpload: (file: File) => void;
  handleMultipleImagesUpload: (files: FileList | null) => void;
  setImageAsCover: (imgUrl: string) => void;
  removeGalleryImage: (idx: number) => void;
  addReview: () => void;
  updateReview: (index: number, field: keyof ProductReviewForm, value: any) => void;
  removeReview: (index: number) => void;
  addPricingPlan: () => void;
  updatePricingPlan: (index: number, field: keyof PricingPlanForm, value: any) => void;
  removePricingPlan: (index: number) => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  editItem,
  form,
  setForm,
  saving,
  slugError,
  handleSlugChange,
  handleTitleChange,
  handleSaveProduct,
  uploadingVideo,
  uploadingMultiImages,
  handleVideoUpload,
  handleMultipleImagesUpload,
  setImageAsCover,
  removeGalleryImage,
  addReview,
  updateReview,
  removeReview,
  addPricingPlan,
  updatePricingPlan,
  removePricingPlan,
}: ProductModalProps) {
  const [activeTab, setActiveTab] = useState<ProductTabType>("basics");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#141519] border border-slate-200 dark:border-gray-800 rounded-[4px] overflow-hidden shadow-2xl my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#111215] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#0167D6] text-white text-white-always flex items-center justify-center font-bold shadow-sm">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editItem ? "Edit Product / SaaS System" : "Add New Finished Product"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                Configure multi-media showcase, rich text specs, and pricing comparison table
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white p-1 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs Header */}
        <div className="flex border-b border-slate-200 dark:border-gray-800 bg-slate-100/70 dark:bg-[#0E0F12] px-5 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("basics")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "basics"
                ? "border-[#0167D6] text-[#0167D6] bg-white dark:bg-transparent dark:text-white dark:border-[#3368B2]"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Tag size={14} /> Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "media"
                ? "border-[#0167D6] text-[#0167D6] bg-white dark:bg-transparent dark:text-white dark:border-[#3368B2]"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <ImageIcon size={14} /> Images & Front Video
            {form.images.length > 0 && (
              <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold">
                {form.images.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "description"
                ? "border-[#0167D6] text-[#0167D6] bg-white dark:bg-transparent dark:text-white dark:border-[#3368B2]"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Layers size={14} /> Description and Reviews
            {form.reviews.length > 0 && (
              <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                {form.reviews.length} Reviews
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pricing"
                ? "border-[#0167D6] text-[#0167D6] bg-white dark:bg-transparent dark:text-white dark:border-[#3368B2]"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <DollarSign size={14} /> Editable Pricing Chart
            {form.pricingPlans.length > 0 && (
              <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                {form.pricingPlans.length} Plans
              </span>
            )}
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "basics" && (
            <ProductBasicsTab
              form={form}
              setForm={setForm}
              slugError={slugError}
              handleSlugChange={handleSlugChange}
              handleTitleChange={handleTitleChange}
            />
          )}

          {activeTab === "media" && (
            <ProductMediaTab
              form={form}
              setForm={setForm}
              uploadingVideo={uploadingVideo}
              uploadingMultiImages={uploadingMultiImages}
              handleVideoUpload={handleVideoUpload}
              handleMultipleImagesUpload={handleMultipleImagesUpload}
              setImageAsCover={setImageAsCover}
              removeGalleryImage={removeGalleryImage}
            />
          )}

          {activeTab === "description" && (
            <ProductDescriptionTab
              form={form}
              setForm={setForm}
              addReview={addReview}
              updateReview={updateReview}
              removeReview={removeReview}
            />
          )}

          {activeTab === "pricing" && (
            <ProductPricingTab
              form={form}
              addPricingPlan={addPricingPlan}
              updatePricingPlan={updatePricingPlan}
              removePricingPlan={removePricingPlan}
            />
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-[#141519] px-6 py-4 -mx-6 -mb-6 mt-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
              <span>
                Current Tab:{" "}
                <strong className="text-slate-900 dark:text-white capitalize font-bold">
                  {activeTab === "description" ? "Description and Reviews" : activeTab}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 text-xs rounded-[4px] font-semibold transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold rounded-[4px] transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{editItem ? "Update Product" : "Publish Product"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
