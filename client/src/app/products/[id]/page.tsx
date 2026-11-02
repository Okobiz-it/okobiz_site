"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Play,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Headphones,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import PreviewModal from "@/components/PreviewModal";
import { ProductItem } from "@/data/mockData";
import { getProductById, getProductWhatsAppUrl } from "@/lib/api";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { renderRichText } from "@/lib/richText";

const REVIEWS = [
  {
    name: "Dr. Rafiqul Islam",
    designation: "Managing Director",
    company: "Al-Madina Pharma Care",
    location: "Dhaka",
    comment: "PharmaCare Pro completely eliminated our medicine expiry losses. The automatic advance alerts and barcode POS billing have made our checkout 3x faster. Outstanding software!",
    rating: 5,
    tag: "Pharmacy ERP"
  },
  {
    name: "Tanvir Ahmed",
    designation: "Founder & Owner",
    company: "The Smokehouse Grill & Cafe",
    location: "Gulshan",
    comment: "The table management and kitchen display (KDS) system transformed our dining service. Zero order mistakes and daily cash register reconciliation is seamless.",
    rating: 5,
    tag: "Restaurant POS"
  },
  {
    name: "Shahidul Alam",
    designation: "Operations Head",
    company: "MegaMart Retail Chain",
    location: "Uttara",
    comment: "ShopFlow Pro handles our 4 cashier counters during peak rush without a single freeze. The customer due SMS notifications increased our collections significantly.",
    rating: 5,
    tag: "Supermarket ERP"
  },
  {
    name: "Engr. Nazmul Huda",
    designation: "General Manager",
    company: "CarePlus Healthcare Diagnostics",
    location: "Chittagong",
    comment: "okobiz team deployed our full clinic and lab management system in less than 48 hours. Direct WhatsApp support responds within 5 minutes whenever we need anything.",
    rating: 5,
    tag: "Healthcare SaaS"
  },
  {
    name: "Farhan Kabir",
    designation: "Managing Partner",
    company: "Taste of Italy Trattoria",
    location: "Banani",
    comment: "Best investment for our restaurant chain. Recipe ingredient costing and daily sales analytics give us exact profit margins every night on our phone.",
    rating: 5,
    tag: "Cloud Kitchen ERP"
  },
  {
    name: "Kamrul Hasan",
    designation: "Proprietor",
    company: "Trust Medicine Corner",
    location: "Mirpur",
    comment: "The generic medicine alternative search is a lifesaver. When a prescribed brand is out of stock, we can immediately offer the generic equivalent to customers.",
    rating: 5,
    tag: "Pharmacy System"
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaType, setActiveMediaType] = useState<"video" | "image">("image");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getProductById(id);
          if (data) {
            setProduct(data);
            // If video attached, video will always show first!
            if (data.video && data.video.trim()) {
              setActiveMediaType("video");
            } else {
              setActiveMediaType("image");
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
  }, [id]);

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#3368B2] border-t-transparent rounded-[4px] animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-xs">Loading product details...</p>
        </div>
      </div>
    );
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
  const videoPosterThumb = product.videoThumbnail || (isYt ? getYouTubeThumbnailUrl(product.video) : null) || product.thumbnail || allImages[0];

  const lowestPrice = product.pricingPlans?.length > 0
    ? Math.min(...product.pricingPlans.map((p) => p.price))
    : 0;

  const highestRegular = product.pricingPlans?.length > 0
    ? Math.max(...product.pricingPlans.map((p) => p.discountPrice || p.price))
    : 0;

  const defaultWhatsappUrl = getProductWhatsAppUrl(product.title, product.whatsappNumber);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Banner */}
      <PageBanner
        title={product.title}
        subtitle={product.tagline || "Enterprise Digital Software & SaaS Solutions by okobiz"}
      />

      {/* Breadcrumbs & Navigation Bar */}
      <div className="bg-[#111215] border-b border-gray-800/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={14} /> Back to Products
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 hidden sm:inline">Category:</span>
            <span className="text-xs font-bold text-[#3368B2] px-2.5 py-0.5 rounded-[4px] bg-blue-900/20 border border-blue-900/30">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Hero Section */}
      <section className="py-12 lg:py-16 bg-[#141416]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT COLUMN: Media (Video & Multi-Image Gallery alongside) - 7 cols */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Media Player / Image Viewer Container */}
              <div className="relative rounded-[4px] overflow-hidden bg-black border border-gray-800 shadow-2xl">
                {activeMediaType === "video" && hasVideo ? (
                  <div className="aspect-video w-full bg-black">
                    {isYt && ytEmbedUrl ? (
                      <iframe
                        src={`${ytEmbedUrl}?autoplay=1&rel=0`}
                        title={product.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={product.video}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
                    <img
                      src={allImages[selectedImageIndex] || allImages[0]}
                      alt={`${product.title} screenshot ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover transition-all duration-300"
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
                    onClick={() => setActiveMediaType("video")}
                    className={`relative w-28 h-18 rounded-[4px] overflow-hidden border shrink-0 transition-all group ${
                      activeMediaType === "video"
                        ? "border-[#3368B2] ring-2 ring-[#3368B2] scale-105"
                        : "border-gray-800 opacity-70 hover:opacity-100"
                    }`}
                    title="Click to view Video Tour"
                  >
                    <img
                      src={videoPosterThumb}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition flex items-center justify-center">
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
                        ? "border-[#3368B2] ring-2 ring-[#3368B2] scale-105"
                        : "border-gray-800 opacity-60 hover:opacity-100"
                    }`}
                    title={`View screenshot ${idx + 1}`}
                  >
                    <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {product.title}
                </h1>

                <p className="mt-2.5 text-sm text-gray-300 leading-relaxed">
                  {product.tagline || "Complete turn-key business software architecture ready for immediate cloud onboarding."}
                </p>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-[4px] bg-[#181A1D] border border-gray-800">
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  PRICE STARTING FROM
                </p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    ৳{lowestPrice.toLocaleString()}
                  </span>
                  {highestRegular > lowestPrice && (
                    <span className="text-sm sm:text-base text-gray-500 line-through">
                      ৳{highestRegular.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-[4px] border border-emerald-800/40">
                    Lifetime License
                  </span>
                </div>
              </div>

              {/* Core Feature Highlights */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    CORE SYSTEM CAPABILITIES:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-300 bg-[#181A1D] p-2.5 rounded-[4px] border border-gray-800">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
                  className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm rounded-[4px] transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60"
                  title="Direct WhatsApp chat requesting live demo"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Ask for Demo on WhatsApp</span>
                </a>

                {product.liveUrl && (
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="w-full py-3 px-6 bg-[#3368B2] hover:bg-[#0167D6] text-white font-bold text-xs uppercase tracking-wider rounded-[4px] transition flex items-center justify-center gap-2 shadow-md shadow-blue-950/50"
                  >
                    <ExternalLink size={15} />
                    <span>View Live Demo</span>
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 px-1">
                  <span className="flex items-center gap-1">
                    <Zap size={12} className="text-emerald-400" /> Immediate reply
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" /> Free onboarding
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" /> 100% Tested
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULL SCREEN SECTION 1: DETAILED SYSTEM SPECIFICATIONS & OVERVIEW */}
      {product.description && (
        <section className="py-16 bg-[#0E0F12] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#141518] border border-gray-800 rounded-[4px] p-6 sm:p-10 shadow-2xl">
              <div className="border-b border-gray-800 pb-4 mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-[#3368B2] px-3 py-1 bg-blue-900/30 rounded-[4px] inline-block mb-2 border border-blue-800/40">
                  Comprehensive Architecture
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Detailed System Specifications & Overview
                </h2>
              </div>

              {/* Render Rich Text Editor Content with universal formatter */}
              <div
                className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-sm sm:text-base space-y-4 rich-text-content"
                dangerouslySetInnerHTML={{ __html: renderRichText(product.description) }}
              />
            </div>
          </div>
        </section>
      )}

      {/* FULL SCREEN SECTION 2: EDITABLE PRICING CHART WITH FEATURES */}
      {product.pricingPlans && product.pricingPlans.length > 0 && (
        <section className="py-20 bg-[#141416] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3368B2] px-3.5 py-1 bg-blue-900/30 rounded-[4px] inline-block mb-3 border border-blue-800/40">
                Transparent & Predictable Pricing
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Choose the Ideal Plan for {product.title}
              </h2>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                All plans include free cloud deployment, data migration, and dedicated onboarding support. Select a package below to order or chat with our specialists on WhatsApp.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {product.pricingPlans.map((plan, idx) => {
                const planWhatsappUrl = getProductWhatsAppUrl(product.title, product.whatsappNumber, plan.name);
                const hasDiscount = plan.discountPrice && plan.discountPrice > plan.price;
                const savingsPct = hasDiscount
                  ? Math.round(((plan.discountPrice - plan.price) / plan.discountPrice) * 100)
                  : 0;

                return (
                  <div
                    key={idx}
                    className={`relative rounded-[4px] p-7 flex flex-col justify-between transition-all duration-300 ${
                      plan.isPopular
                        ? "bg-[#181A1E] border-2 border-[#3368B2] shadow-2xl shadow-blue-900/30 scale-[1.02] z-10"
                        : "bg-[#111215] border border-gray-800 hover:border-gray-700 shadow-xl"
                    }`}
                  >
                    {/* Popular Ribbon */}
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3368B2] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-[4px] uppercase tracking-wider shadow-lg">
                        ⭐ Most Popular Choice
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-extrabold text-white">
                          {plan.name}
                        </h3>
                        {plan.badge && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-[4px] bg-gray-800 text-gray-300 border border-gray-700">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 min-h-[36px] mb-6">
                        {plan.description || "Comprehensive software features tailored for this business tier."}
                      </p>

                      {/* Pricing block */}
                      <div className="pb-6 mb-6 border-b border-gray-800/80">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white">
                            ৳{plan.price?.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              ৳{plan.discountPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">
                            {plan.period || "One-Time Setup"}
                          </span>
                          {savingsPct > 0 && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-[4px]">
                              Save {savingsPct}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 mb-8">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Included Features:
                        </p>
                        <ul className="space-y-2.5">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
                      className={`w-full py-3 px-4 rounded-[4px] text-xs font-bold transition flex items-center justify-center gap-2 text-center shadow-md ${
                        plan.isPopular
                          ? "bg-[#3368B2] hover:bg-[#0167D6] text-white shadow-blue-900/40"
                          : "bg-gray-800 hover:bg-gray-700 text-white"
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
      )}

      {/* FULL SCREEN SECTION 3: REVIEWS SLIDING LEFT TO RIGHT & PAUSE ON HOVER */}
      <section className="py-20 bg-[#0E0F12] border-t border-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 px-3.5 py-1 bg-emerald-950/40 rounded-[4px] inline-block mb-3 border border-emerald-800/40">
            Client Success Stories
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Trusted by 150+ Businesses Nationwide
          </h2>
          <p className="mt-2 text-sm text-gray-400 max-w-2xl mx-auto">
            Hover over any review to pause the slider and read verified feedback from companies running on okobiz software.
          </p>
        </div>

        {/* Infinite Marquee Slider: Floats smoothly from left to right, pauses on hover */}
        {(() => {
          const productReviews = (product.reviews && product.reviews.length > 0) ? product.reviews : REVIEWS;
          const marqueeReviews = productReviews.length < 3
            ? [...productReviews, ...productReviews, ...productReviews, ...productReviews]
            : [...productReviews, ...productReviews];

          return (
            <div className="relative w-full overflow-hidden py-4 group">
              {/* Gradient Edge Masks for High-End Glass Feel */}
              <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0E0F12] to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0E0F12] to-transparent z-10 pointer-events-none" />

              <div className="reviews-marquee-track flex gap-6">
                {marqueeReviews.map((rev, index) => (
                  <div
                    key={index}
                    className="w-[340px] sm:w-[400px] shrink-0 bg-[#15171B] border border-gray-800 hover:border-[#3368B2] rounded-[4px] p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col justify-between"
                  >
                    <div>
                      {/* Star Rating */}
                      <div className="flex items-center gap-1 text-amber-400 mb-4">
                        {Array.from({ length: Math.max(1, Math.min(5, rev.rating || 5)) }).map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400" />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className="pt-4 border-t border-gray-800/80">
                      <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {rev.designation ? rev.designation : ""}
                        {rev.designation && rev.company ? ", " : ""}
                        {rev.company ? <span className="text-gray-300 font-semibold">{rev.company}</span> : null}
                        {rev.location ? ` • ${rev.location}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Talk CTA */}
      <TalkCta />

      {/* Live Preview Modal */}
      {isPreviewOpen && product.liveUrl && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          url={product.liveUrl}
          title={product.title}
        />
      )}
    </div>
  );
}
