"use client";

import React from "react";
import { isYouTubeUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import {
  Play,
  ExternalLink,
  MessageCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
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
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-[#141519] border border-gray-800 rounded-xl p-12 text-center">
        <Package size={40} className="mx-auto text-gray-600 mb-3" />
        <h3 className="text-base font-bold text-white mb-1">No SaaS Products Published Yet</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto mb-5">
          Start building your finished products showcase. You can configure rich text descriptions, screenshots, pricing plans, and client success reviews.
        </p>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#3368B2] hover:bg-[#0167D6] text-white text-xs font-bold rounded-[4px] transition"
        >
          Add First Finished Product
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#141519] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-[11px] uppercase tracking-wider text-gray-400 bg-[#111215]">
              <th className="py-3 px-4">Product & Media</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Pricing Plans</th>
              <th className="py-3 px-4">Demo & WhatsApp</th>
              <th className="py-3 px-4 text-center">Badges</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {paginated.map((product) => {
              const hasVideo = Boolean(product.video);
              const isYt = isYouTubeUrl(product.video);
              const ytThumb = isYt ? getYouTubeThumbnailUrl(product.video) : null;
              const isVideoFirst = product.mediaType === "video" && hasVideo;
              const displayThumb = isVideoFirst
                ? (product.videoThumbnail || ytThumb || product.thumbnail || "/assets/web-2-DujjTO8C.webp")
                : (product.thumbnail || product.videoThumbnail || ytThumb || "/assets/web-2-DujjTO8C.webp");
              const imageCount = product.images?.length || 1;
              const lowestPrice =
                product.pricingPlans?.length > 0
                  ? Math.min(...product.pricingPlans.map((p: any) => p.price))
                  : 0;

              const cleanPhone = (product.whatsappNumber || "8801973590937").replace(/[^0-9]/g, "");
              const whatsappDemoUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hello okobiz, I would like to request a live demo for "${product.title}". Please provide test access.`
              )}`;

              return (
                <tr key={product._id} className="hover:bg-white/[0.02] transition">
                  {/* Media & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-12 rounded-[4px] overflow-hidden bg-black border border-gray-800 shrink-0">
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
                        <span className="font-bold text-white text-sm hover:text-[#3368B2] transition block">
                          {product.title}
                        </span>
                        <p className="text-[11px] text-gray-400 line-clamp-1 max-w-sm mt-0.5">
                          {product.tagline || "Finished Digital SaaS Solution"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-[3px] bg-blue-900/20 text-[#3368B2] font-semibold border border-blue-900/30 text-[11px]">
                      {product.category}
                    </span>
                  </td>

                  {/* Pricing Plans */}
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="text-white font-bold">
                        {lowestPrice > 0
                          ? `From ৳${lowestPrice.toLocaleString()}`
                          : "Contact for Quote"}
                      </span>
                      <p className="text-[10px] text-gray-400">
                        {product.pricingPlans?.length || 0} Pricing Tier
                        {product.pricingPlans?.length === 1 ? "" : "s"}
                      </p>
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
                          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                          title="Open Live Demo"
                        >
                          <ExternalLink size={12} /> Live
                        </a>
                      )}
                      <a
                        href={whatsappDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/80 border border-emerald-800/40 text-[10px] font-bold"
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
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                          Popular
                        </span>
                      )}
                      {product.featuredBadge && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
                          Featured
                        </span>
                      )}
                      {!product.popularBadge && !product.featuredBadge && (
                        <span className="text-[10px] text-gray-500">—</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-blue-600/20 transition"
                        title="Edit Product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded bg-[#0E0F12] border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded bg-[#0E0F12] border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
