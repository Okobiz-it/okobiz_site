"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Play,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Cpu
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import UniversalLoader from "@/components/UniversalLoader";
import ProductPricingSection from "@/components/ProductPricingSection";
import ProductReviewsSection from "@/components/ProductReviewsSection";
import { ProductItem } from "@/data/mockData";
import { getProductById, getProductWhatsAppUrl } from "@/lib/api";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { renderRichText } from "@/lib/richText";
import { getTechIcon } from "@/lib/techIcons";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const autoPlayFromUrl = searchParams?.get("autoplay") === "true";

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaType, setActiveMediaType] = useState<"video" | "image">("image");
  const [isVideoPlaying, setIsVideoPlaying] = useState(autoPlayFromUrl);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (searchParams?.get("autoplay") === "true") {
      setActiveMediaType("video");
      setIsVideoPlaying(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getProductById(id);
          if (data) {
            setProduct(data);
            const hasVid = Boolean(data.video && data.video.trim());
            const isVideoFirst = data.mediaType === "video" && hasVid;

            // If "Show Video First" is configured in admin or user clicked play button (?autoplay=true)
            if (isVideoFirst) {
              setActiveMediaType("video");
              setIsVideoPlaying(autoPlayFromUrl);
            } else if (hasVid && autoPlayFromUrl) {
              setActiveMediaType("video");
              setIsVideoPlaying(true);
            } else if (data.images && data.images.length > 0) {
              setActiveMediaType("image");
              setIsVideoPlaying(false);
            } else if (hasVid) {
              setActiveMediaType("video");
              setIsVideoPlaying(false);
            } else {
              setActiveMediaType("image");
              setIsVideoPlaying(false);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to load product details:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, autoPlayFromUrl]);

  if (loading) {
    return <UniversalLoader fullScreen size="lg" />;
  }

  if (!product) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-400 text-sm mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/products"
          className="px-5 py-2.5 bg-[#3368B2] text-white text-xs font-bold rounded-[4px]"
        >
          Back to Products Catalog
        </Link>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0
    ? product.images
    : (product.thumbnail ? [product.thumbnail] : ["/assets/web-2-DujjTO8C.webp"]);

  const hasVideo = Boolean(product.video && product.video.trim());
  const isYt = isYouTubeUrl(product.video);
  const ytEmbedUrl = isYt ? getYouTubeEmbedUrl(product.video) : null;
  const ytThumb = isYt ? getYouTubeThumbnailUrl(product.video) : null;
  const isCustomVideoThumb = Boolean(
    product.videoThumbnail &&
    !product.videoThumbnail.startsWith("/assets/") &&
    product.videoThumbnail !== product.thumbnail &&
    !product.videoThumbnail.includes("web-2-DujjTO8C")
  );
  const videoPosterThumb = isCustomVideoThumb
    ? product.videoThumbnail
    : (ytThumb || product.videoThumbnail || product.thumbnail || allImages[0]);

  const lowestPrice = product.pricingPlans?.length > 0
    ? Math.min(...product.pricingPlans.map((p) => p.price))
    : 0;

  const highestRegular = product.pricingPlans?.length > 0
    ? Math.max(...product.pricingPlans.map((p) => p.discountPrice || p.price))
    : 0;

  const defaultWhatsappUrl = getProductWhatsAppUrl(product.title, product.whatsappNumber);

  return (
    <div className="bg-[#F8FAFC] dark:bg-black text-slate-900 dark:text-white min-h-screen">
      {/* Banner */}
      <PageBanner
        title={product.title}
        subtitle={product.tagline || "Enterprise Digital Software & SaaS Solutions by okobiz"}
      />

      {/* Breadcrumbs & Navigation Bar */}
      <div className="bg-slate-100 dark:bg-[#111215] border-b border-slate-200 dark:border-gray-800/80 py-3.5">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 hover:text-[#0167D6] dark:hover:text-white transition"
          >
            <ArrowLeft size={14} /> Back to Products
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-gray-400 hidden sm:inline">Category:</span>
            <span className="text-xs font-bold text-[#0167D6] dark:text-[#3368B2] px-2.5 py-0.5 rounded-[4px] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Hero Section */}
      <section className="py-12 lg:py-16 bg-white dark:bg-[#141416] border-b border-slate-200 dark:border-gray-800/80">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT COLUMN: Media (Video & Multi-Image Gallery alongside) - 7 cols */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Media Player / Image Viewer Container */}
              <div className="relative rounded-[4px] overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-gray-800 shadow-lg">
                {activeMediaType === "video" && hasVideo ? (
                  !isVideoPlaying ? (
                    /* Paused state when user clicked outside video play frame */
                    <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center group overflow-hidden">
                      <img
                        src={videoPosterThumb}
                        alt={`${product.title} video preview`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes("web-2-DujjTO8C")) {
                            target.src = "/assets/web-2-DujjTO8C.webp";
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setIsVideoPlaying(true)}
                        className="absolute z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0167D6] hover:bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 backdrop-blur-md border-2 border-white/70 hover:scale-110 transition-all cursor-pointer"
                        aria-label="Click to play video"
                      >
                        <Play size={28} fill="white" className="ml-1 text-white" />
                      </button>
                      <div className="absolute bottom-4 left-4 z-10 text-xs font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-[4px] border border-gray-700">
                        Click to play video
                      </div>
                    </div>
                  ) : (
                    /* Autoplaying state when user clicked video play frame */
                    <div className="aspect-video w-full bg-black">
                      {isYt && ytEmbedUrl ? (
                        <iframe
                          src={getYouTubeEmbedUrl(product.video, true) || `${ytEmbedUrl}?autoplay=1&rel=0`}
                          title={product.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={product.video}
                          poster={videoPosterThumb}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                          onPlay={() => setIsVideoPlaying(true)}
                          onPause={() => setIsVideoPlaying(false)}
                        />
                      )}
                    </div>
                  )
                ) : (
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-gray-950 flex items-center justify-center p-2 sm:p-4">
                    <img
                      src={allImages[selectedImageIndex] || allImages[0]}
                      alt={`${product.title} screenshot ${selectedImageIndex + 1}`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("web-2-DujjTO8C")) {
                          target.src = "/assets/web-2-DujjTO8C.webp";
                        }
                      }}
                      className="w-full h-full object-contain max-h-[500px] transition-all duration-300 rounded-[2px]"
                    />

                    {/* Screenshot Counter Pill */}
                    <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-gray-200 text-[11px] font-bold px-2.5 py-1 rounded-[4px] border border-gray-700">
                      Screenshot {selectedImageIndex + 1} of {allImages.length}
                    </span>

                    {/* Navigation Arrows for Images */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev === 0 ? allImages.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[4px] bg-black/70 hover:bg-black text-white flex items-center justify-center transition border border-gray-700"
                          aria-label="Previous Screenshot"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev === allImages.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[4px] bg-black/70 hover:bg-black text-white flex items-center justify-center transition border border-gray-700"
                          aria-label="Next Screenshot"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnails Strip: Video thumbnail alongside photos! */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {/* 1. Video Thumbnail if attached (always first alongside photos) */}
                {hasVideo && (
                  <button
                    onClick={() => {
                      setActiveMediaType("video");
                      setIsVideoPlaying(true);
                    }}
                    className={`relative w-28 h-18 rounded-[4px] overflow-hidden border shrink-0 transition-all group ${
                      activeMediaType === "video"
                        ? "border-[#0167D6] ring-2 ring-[#0167D6] scale-105"
                        : "border-slate-300 dark:border-gray-800 opacity-75 hover:opacity-100 bg-slate-100 dark:bg-black"
                    }`}
                    title="Click to view Video Tour"
                  >
                    <img
                      src={videoPosterThumb}
                      alt="Video thumbnail"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("web-2-DujjTO8C")) {
                          target.src = "/assets/web-2-DujjTO8C.webp";
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 rounded-[4px] bg-red-600 flex items-center justify-center shadow">
                        <Play size={11} className="fill-white text-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 bg-black/80 text-[9px] text-white font-bold py-0.5 text-center rounded-[2px] truncate">
                      Video Tour
                    </span>
                  </button>
                )}

                {/* 2. Photo Screenshots Thumbnails */}
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setActiveMediaType("image");
                    }}
                    className={`relative w-28 h-18 rounded-[4px] overflow-hidden border shrink-0 transition-all ${
                      activeMediaType === "image" && selectedImageIndex === idx
                        ? "border-[#0167D6] ring-2 ring-[#0167D6] scale-105"
                        : "border-slate-300 dark:border-gray-800 opacity-75 hover:opacity-100 bg-slate-100 dark:bg-black"
                    }`}
                    title={`View screenshot ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Screenshot ${idx + 1}`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("web-2-DujjTO8C")) {
                          target.src = "/assets/web-2-DujjTO8C.webp";
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-gray-300 font-bold px-1 rounded-[2px]">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Sales Information & Call to Actions - 5 cols */}
            <div className="lg:col-span-5 space-y-6">
              {/* Product Header & Tagline (Badges removed per user instruction) */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {product.title}
                </h1>

                <p className="mt-2.5 text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
                  {product.tagline || "Complete turn-key business software architecture ready for immediate cloud onboarding."}
                </p>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800">
                <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-gray-400 tracking-wider">
                  PRICE STARTING FROM
                </p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    ৳{lowestPrice.toLocaleString()}
                  </span>
                  {highestRegular > lowestPrice && (
                    <span className="text-sm sm:text-base text-slate-400 dark:text-gray-500 line-through">
                      ৳{highestRegular.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-[4px] border border-emerald-200 dark:border-emerald-800/40">
                    Lifetime License
                  </span>
                </div>
              </div>

              {/* Core Feature Highlights */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    CORE SYSTEM CAPABILITIES:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#181A1D] p-2.5 rounded-[4px] border border-slate-200 dark:border-gray-800">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Ask for Demo & View Live Demo */}
              <div className="pt-2 space-y-3">
                <a
                  href={defaultWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-[#0167D6] hover:bg-blue-600 text-white font-extrabold text-sm rounded-[4px] transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-blue-500/25"
                  title="Direct WhatsApp chat requesting live demo"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Ask for Demo on WhatsApp</span>
                </a>

                {product.liveUrl && (
                  <a
                    href={product.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider rounded-[4px] border border-slate-300 dark:border-gray-700 transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={15} />
                    <span>View Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULL SCREEN SECTION 1: DETAILED SYSTEM SPECIFICATIONS & OVERVIEW */}
      {product.description && (
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0E0F12] border-t border-slate-200 dark:border-gray-800">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
            <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 sm:p-10 shadow-md">
              <div className="border-b border-slate-200 dark:border-gray-800 pb-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Detailed System Specifications & Overview
                </h2>
              </div>

              {/* Render Rich Text Editor Content with universal formatter */}
              <div
                className="prose dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base space-y-4 rich-text-content [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_li]:text-slate-700 dark:[&_li]:text-gray-300 [&_a]:text-[#0167D6]"
                dangerouslySetInnerHTML={{ __html: renderRichText(product.description) }}
              />
            </div>
          </div>
        </section>
      )}

      {/* FULL SCREEN SECTION: TECHNOLOGY FRAMEWORKS & TOOLS */}
      {product.techStack && product.techStack.length > 0 && (
        <section className="py-12 bg-white dark:bg-[#141518] border-t border-slate-200 dark:border-gray-800">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
            <div className="bg-slate-50 dark:bg-[#0E0F12] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 sm:p-8 shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-[#0167D6]" />
                <span>Technology Frameworks & Tools</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 mb-5">
                Underlying technical infrastructure, languages, databases, and deployment frameworks powering this system.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.techStack.map((tech, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] bg-white dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-xs font-semibold text-slate-800 dark:text-gray-200 shadow-2xs hover:border-[#0167D6] hover:text-[#0167D6] transition group"
                  >
                    <span className="text-[#0167D6] shrink-0 group-hover:scale-110 transition-transform">
                      {getTechIcon(tech, "w-4 h-4 text-[#0167D6]")}
                    </span>
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FULL SCREEN SECTION 2: EDITABLE PRICING CHART WITH FEATURES */}
      <ProductPricingSection
        pricingPlans={product.pricingPlans}
        productTitle={product.title}
        whatsappNumber={product.whatsappNumber}
      />

      {/* FULL SCREEN SECTION 3: REVIEWS SLIDING LEFT TO RIGHT & PAUSE ON HOVER */}
      <ProductReviewsSection reviews={product.reviews} />

      {/* Talk CTA */}
      <TalkCta />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<UniversalLoader fullScreen size="lg" />}>
      <ProductDetailContent />
    </Suspense>
  );
}
