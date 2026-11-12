"use client";

import React, { useState } from "react";
import Link from "next/link";
import { isYouTubeUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { cleanSnippet } from "@/lib/richText";
import {
  Play,
  ExternalLink,
  MessageCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  ImageIcon,
  Star,
  Sparkles,
  LayoutGrid,
  List
} from "lucide-react";

interface ProductTableProps {
  products: any[];
  paginated: any[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  openEdit: (item: any) => void;
  handleDelete: (id: string) => void;
  openCreate: () => void;
  viewMode?: "grid" | "table";
  onToggleViewMode?: (mode: "grid" | "table") => void;
}

export default function ProductTable({
  products,
  paginated,
  currentPage,
  totalPages,
  setCurrentPage,
  openEdit,
  handleDelete,
  openCreate,
  viewMode = "grid",
  onToggleViewMode,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141519] border border-slate-200 dark:border-gray-800 rounded-[6px] p-12 text-center shadow-sm">
        <Package size={40} className="mx-auto text-slate-400 dark:text-gray-600 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No SaaS Products Published Yet</h3>
        <p className="text-xs text-slate-600 dark:text-gray-400 max-w-md mx-auto mb-5">
          Start building your finished products showcase. You can configure rich text descriptions, screenshots, pricing plans, and client success reviews.
        </p>
        <Link
          href="/dashboard/products/create"
          className="inline-block px-4 py-2 bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold rounded-[4px] transition shadow-md shadow-blue-500/20"
        >
          Add First Finished Product
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid View (Default) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {paginated.map((product) => {
            const hasVideo = Boolean(product.video);
            const isYt = isYouTubeUrl(product.video);
            const ytThumb = isYt ? getYouTubeThumbnailUrl(product.video) : null;
            const isVideoFirst = product.mediaType === "video" && hasVideo;
            const displayThumb = isVideoFirst
              ? (product.videoThumbnail || ytThumb || product.thumbnail || "/assets/web-2-DujjTO8C.webp")
              : (product.thumbnail || product.videoThumbnail || ytThumb || "/assets/web-2-DujjTO8C.webp");
            const lowestPrice =
              product.pricingPlans?.length > 0
                ? Math.min(...product.pricingPlans.map((p: any) => p.price))
                : 0;

            const cleanPhone = (product.whatsappNumber || "8801973590937").replace(/[^0-9]/g, "");
            const whatsappDemoUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello okobiz, I would like to request a live demo for "${product.title}". Please provide test access.`
            )}`;

            return (
              <div
                key={product._id}
                className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[6px] overflow-hidden group hover:border-[#0167D6] dark:hover:border-[#3368B2]/60 transition shadow-xs hover:shadow-md flex flex-col justify-between h-[355px]"
              >
                {/* Media Thumbnail (Fixed aspect-video / 190px matching Services & Portfolio) */}
                <div className="h-[190px] aspect-video w-full bg-slate-100 dark:bg-black relative overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={displayThumb}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e: any) => {
                      e.target.src = "/assets/web-2-DujjTO8C.webp";
                    }}
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {hasVideo ? (
                      <span className="px-2 py-0.5 rounded-[4px] bg-rose-600 text-white text-white-always text-[10px] font-bold flex items-center gap-1 shadow-sm border border-rose-500/30">
                        <Play size={10} className="fill-white text-white text-white-always" />
                        <span className="text-white text-white-always">VIDEO</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-[4px] bg-white/95 dark:bg-black/75 text-slate-800 dark:text-white backdrop-blur-md text-[10px] font-bold flex items-center gap-1 shadow-sm border border-slate-300/80 dark:border-white/15">
                        <ImageIcon size={10} className="text-slate-700 dark:text-slate-200" />
                        <span>IMAGE</span>
                      </span>
                    )}

                    {product.featuredBadge && (
                      <span className="px-2.5 py-0.5 rounded-[4px] bg-purple-600 text-white text-white-always text-[10px] font-bold flex items-center gap-1 shadow-sm border border-purple-500/40">
                        <Star size={10} className="fill-white text-white text-white-always" />
                        <span className="text-white text-white-always">FEATURED</span>
                      </span>
                    )}

                    {product.popularBadge && (
                      <span className="px-2.5 py-0.5 rounded-[4px] bg-amber-500 text-white text-white-always text-[10px] font-bold flex items-center gap-1 shadow-sm border border-amber-400/40">
                        <Sparkles size={10} className="text-white text-white-always" />
                        <span className="text-white text-white-always">POPULAR</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2.5 py-0.5 rounded-[4px] bg-white/95 dark:bg-black/75 text-slate-800 dark:text-gray-200 backdrop-blur-md text-[10px] font-mono font-semibold border border-slate-300/80 dark:border-white/15 shadow-sm">
                      {product.category || "SaaS Solution"}
                    </span>
                  </div>
                </div>

                {/* Content Body (Flexible container with guaranteed min-height snippet) */}
                <div className="p-4 flex-1 flex flex-col justify-between min-h-0 space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400">
                      <span className="font-semibold text-[#0167D6] dark:text-blue-400 text-[10px] uppercase tracking-wider">
                        {product.pricingPlans?.length || 0} {product.pricingPlans?.length === 1 ? "Plan" : "Plans"} Available
                      </span>
                      {lowestPrice > 0 && (
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          From ৳ {lowestPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0167D6] transition">
                      {product.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {cleanSnippet(product.tagline || product.fullDescription, 260) || (
                        <span className="italic text-slate-400 dark:text-gray-600">Finished enterprise digital SaaS solution</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions (Fixed height h-[52px]) */}
                <div className="p-3.5 bg-slate-50/80 dark:bg-[#181A1F]/80 border-t border-slate-200 dark:border-gray-800/80 flex items-center justify-between shrink-0 h-[52px]">
                  <a
                    href={`http://localhost:3000/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-[#0167D6] dark:text-gray-400 dark:hover:text-white transition font-medium"
                  >
                    <ExternalLink size={12} className="text-[#0167D6] dark:text-[#3368B2]" />
                    <span>View Product</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/products/${product._id}/edit`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-slate-100 dark:bg-white/5 hover:bg-[#0167D6] hover:text-white text-slate-700 dark:text-gray-300 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-transparent transition"
                      title="Edit Product"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-1.5 rounded-[4px] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-transparent transition cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-[#141519] border border-slate-200 dark:border-gray-800 rounded-[6px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-gray-800 text-[11px] uppercase tracking-wider text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-[#111215]">
                  <th className="py-3 px-4">Product &amp; Media</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing Plans</th>
                  <th className="py-3 px-4">Demo &amp; WhatsApp</th>
                  <th className="py-3 px-4 text-center">Badges</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
                {paginated.map((product) => {
                  const hasVideo = Boolean(product.video);
                  const isYt = isYouTubeUrl(product.video);
                  const ytThumb = isYt ? getYouTubeThumbnailUrl(product.video) : null;
                  const isVideoFirst = product.mediaType === "video" && hasVideo;
                  const displayThumb = isVideoFirst
                    ? (product.videoThumbnail || ytThumb || product.thumbnail || "/assets/web-2-DujjTO8C.webp")
                    : (product.thumbnail || product.videoThumbnail || ytThumb || "/assets/web-2-DujjTO8C.webp");
                  const lowestPrice =
                    product.pricingPlans?.length > 0
                      ? Math.min(...product.pricingPlans.map((p: any) => p.price))
                      : 0;

                  const cleanPhone = (product.whatsappNumber || "8801973590937").replace(/[^0-9]/g, "");
                  const whatsappDemoUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hello okobiz, I would like to request a live demo for "${product.title}". Please provide test access.`
                  )}`;

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                      {/* Media & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-12 rounded-[4px] overflow-hidden bg-black border border-slate-200 dark:border-gray-800 shrink-0">
                            <img
                              src={displayThumb}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                            {hasVideo && (
                              <span
                                className="absolute bottom-1 right-1 bg-red-600 text-white p-0.5 rounded-full"
                                title="Front Video Enabled"
                              >
                                <Play size={8} className="fill-white" />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm hover:text-[#0167D6] transition block">
                              {product.title}
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-1 max-w-sm mt-0.5">
                              {product.tagline || "Finished Digital SaaS Solution"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-[3px] bg-blue-50 text-[#0167D6] font-semibold border border-blue-200 dark:bg-blue-900/20 dark:text-[#3368B2] dark:border-blue-900/30 text-[11px]">
                          {product.category}
                        </span>
                      </td>

                      {/* Pricing Plans */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="text-slate-900 dark:text-white font-bold">
                            {lowestPrice > 0 ? `From ৳${lowestPrice.toLocaleString()}` : "Free Consultation"}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 block">
                            {product.pricingPlans?.length || 0} Pricing Tiers
                          </span>
                        </div>
                      </td>

                      {/* Demo & WhatsApp */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {product.liveUrl && (
                            <a
                              href={product.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#0167D6] dark:text-blue-400 hover:underline font-semibold"
                              title="Open Live Demo"
                            >
                              <ExternalLink size={12} /> Live
                            </a>
                          )}
                          <a
                            href={whatsappDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/80 dark:border-emerald-800/40 text-[10px] font-bold"
                            title="Test WhatsApp Demo Chat"
                          >
                            <MessageCircle size={10} /> Test Demo WA
                          </a>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {product.popularBadge && (
                            <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                              Popular
                            </span>
                          )}
                          {product.featuredBadge && (
                            <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
                              Featured
                            </span>
                          )}
                          {!product.popularBadge && !product.featuredBadge && (
                            <span className="text-[10px] text-slate-400 dark:text-gray-500">—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/products/${product._id}/edit`}
                            className="p-1.5 rounded text-slate-500 hover:text-[#0167D6] hover:bg-blue-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-blue-600/20 transition inline-flex items-center justify-center"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-gray-400">
            Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 rounded-[4px] bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-[4px] bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
