"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  MessageCircle,
  Play,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  ImageIcon
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import SectionLoader from "@/components/SectionLoader";
import { ProductItem } from "@/data/mockData";
import { getProducts, getProductWhatsAppUrl } from "@/lib/api";
import { isYouTubeUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";

const ITEMS_PER_PAGE = 9;

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (e) {
        console.warn("Failed to fetch live products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.status === "draft") return false;
        const matchSearch =
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.tagline && p.tagline.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchCategory =
          selectedCategory === "All" || p.category === selectedCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        const getLowestPrice = (prod: ProductItem) => {
          if (!prod.pricingPlans || prod.pricingPlans.length === 0) return 0;
          return Math.min(...prod.pricingPlans.map((pl) => pl.price));
        };

        switch (sortBy) {
          case "PriceLow":
            return getLowestPrice(a) - getLowestPrice(b);
          case "PriceHigh":
            return getLowestPrice(b) - getLowestPrice(a);
          case "Popular":
            return (b.popularBadge ? 1 : 0) - (a.popularBadge ? 1 : 0);
          case "Recommended":
          default:
            return (a.order || 99) - (b.order || 99);
        }
      });
  }, [products, searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <PageBanner
        title="Finished Digital Products & SaaS Systems"
        subtitle="Battle-tested, turnkey software & enterprise management systems ready for deployment. Test live demos, compare pricing plans, or request a personalized demo on WhatsApp."
      />

      {/* Main Catalog Section */}
      <section className="py-16 bg-[#141416]" ref={gridTopRef}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          {/* Controls Bar: Search, Category & Sort */}
          <div className="bg-[#181A1D] border border-gray-800 rounded-[4px] p-5 sm:p-6 mb-12 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products (e.g. Pharmacy, Restaurant, POS)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-gray-700 rounded-[4px] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2] transition-colors"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-semibold px-3.5 py-2 rounded-[4px] transition-all ${
                      selectedCategory === cat
                        ? "bg-[#3368B2] text-white shadow-md shadow-blue-900/40"
                        : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-black/60 border border-gray-700 rounded-[4px] px-3 py-2 text-xs font-semibold text-gray-200 focus:outline-none focus:border-[#3368B2]"
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Popular">Most Popular</option>
                  <option value="PriceLow">Price: Low to High</option>
                  <option value="PriceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="bg-[#181A1D] rounded-[4px] border border-gray-800 py-10">
              <SectionLoader size="md" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#181A1D] rounded-[4px] border border-gray-800">
              <p className="text-gray-400 text-base">No finished products matched your search.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-4 px-4 py-2 bg-[#3368B2] text-white text-xs font-bold rounded-[4px]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product) => {
                  const startingPlan =
                    product.pricingPlans && product.pricingPlans.length > 0
                      ? product.pricingPlans.reduce((min, p) => (p.price < min.price ? p : min), product.pricingPlans[0])
                      : null;

                  const lowestPrice = startingPlan ? startingPlan.price : 0;
                  const regularPrice = startingPlan ? (startingPlan.discountPrice || 0) : 0;

                  const hasDiscount = regularPrice > lowestPrice;
                  const savingsPct = hasDiscount
                    ? Math.round(((regularPrice - lowestPrice) / regularPrice) * 100)
                    : 0;

                  const hasVideo = Boolean(product.video && product.video.trim());
                  const isYt = isYouTubeUrl(product.video);
                  const ytThumb = isYt ? getYouTubeThumbnailUrl(product.video) : null;
                  const isCustomVideoThumb = Boolean(
                    product.videoThumbnail &&
                    !product.videoThumbnail.startsWith("/assets/") &&
                    product.videoThumbnail !== product.thumbnail &&
                    !product.videoThumbnail.includes("web-2-DujjTO8C")
                  );
                  const videoThumbnail = isCustomVideoThumb
                    ? product.videoThumbnail
                    : (ytThumb || product.videoThumbnail || null);

                  // If video is selected ("Show Video First" / mediaType === "video") and has video, display video thumbnail on card
                  const isVideoFirst = (product.mediaType === "video" || !product.mediaType) && hasVideo;
                  const displayThumb = isVideoFirst
                    ? (videoThumbnail || product.thumbnail || product.images?.[0] || "/assets/web-2-DujjTO8C.webp")
                    : (product.thumbnail || videoThumbnail || product.images?.[0] || "/assets/web-2-DujjTO8C.webp");
                  const whatsappDemoUrl = getProductWhatsAppUrl(product.title, product.whatsappNumber);

                  return (
                    <div
                      key={product._id}
                      className="bg-[#181A1D] border border-gray-800 rounded-[4px] overflow-hidden hover:border-[#3368B2] transition-all duration-300 group flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-blue-900/10"
                    >
                      <div>
                        {/* Media Cover - clicking video frame opens detail page and autoplays */}
                        <Link
                          href={
                            hasVideo
                              ? `/products/${product.slug || product._id}?autoplay=true`
                              : `/products/${product.slug || product._id}`
                          }
                          className="relative h-60 overflow-hidden bg-gray-900 block group/cover"
                          title={hasVideo ? "Watch Video Demo" : product.title}
                        >
                          <img
                            src={displayThumb}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="bg-[#3368B2] text-white text-[11px] font-extrabold px-3 py-1 rounded-[4px] shadow-lg">
                              {product.category}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {product.popularBadge && (
                              <span className="bg-amber-500 text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-[4px] shadow-lg flex items-center gap-1">
                                <Sparkles size={11} className="fill-black" /> Popular
                              </span>
                            )}
                          </div>

                          {/* Video Play Button Overlay if product contains video */}
                          {hasVideo && (
                            <div className="absolute inset-0 flex items-center justify-center group-hover/cover:scale-110 transition-transform duration-300">
                              <div className="w-14 h-14 rounded-full bg-rose-600/95 text-white flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.85)] backdrop-blur-sm border-2 border-rose-400 animate-play-blink">
                                <Play size={24} fill="white" className="ml-1" />
                              </div>
                            </div>
                          )}
                        </Link>

                        {/* Card Details */}
                        <div className="p-6">
                          <Link href={`/products/${product.slug || product._id}`}>
                            <h3 className="text-lg font-extrabold text-white mb-2 line-clamp-1 group-hover:text-[#0167D6] transition-colors">
                              {product.title}
                            </h3>
                          </Link>

                          <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                            {product.tagline || "Enterprise ready cloud system with automated workflows."}
                          </p>

                          {/* Top 3 Highlight Bullets */}
                          {product.features && product.features.length > 0 && (
                            <div className="space-y-1.5 mb-5 pb-4 border-b border-gray-800/80">
                              {product.features.slice(0, 3).map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pricing Display */}
                          <div className="flex items-baseline justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                Starting From
                              </p>
                              <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-2xl font-extrabold text-white">
                                  ৳{lowestPrice.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                  <span className="text-xs text-gray-500 line-through">
                                    ৳{regularPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {savingsPct > 0 && (
                              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-[4px]">
                                Save {savingsPct}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-6 pb-6 pt-3 border-t border-gray-800/80">
                        <div className="flex items-center gap-2.5">
                          {/* Ask for Demo WhatsApp Button */}
                          <a
                            href={whatsappDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] py-2.5 px-3 rounded-[4px] transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50"
                            title="Direct WhatsApp chat asking for demo of this product"
                          >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            <span>Ask for Demo</span>
                          </a>

                          {/* View Live Button */}
                          {product.liveUrl && (
                            <a
                              href={product.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-[4px] bg-gray-800 hover:bg-gray-700 transition-colors"
                              title="Test Live Demo"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Live</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="mt-14 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-gray-400">
                    Showing <span className="text-white font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="text-white font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> of <span className="text-white font-semibold">{filteredProducts.length}</span> finished products
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-[4px] bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:border-[#3368B2] disabled:opacity-30 disabled:pointer-events-none transition"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded-[4px] text-xs font-bold transition ${
                          currentPage === page
                            ? "bg-[#3368B2] text-white shadow-lg shadow-blue-900/40"
                            : "bg-[#181A1D] border border-gray-800 text-gray-300 hover:border-gray-600 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-[4px] bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:border-[#3368B2] disabled:opacity-30 disabled:pointer-events-none transition"
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Conversion Talk CTA */}
      <TalkCta />
    </div>
  );
}
