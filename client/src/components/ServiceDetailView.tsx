"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Phone,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  MessageSquare,
  Play
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import UniversalLoader from "@/components/UniversalLoader";
import DataLoadError from "@/components/DataLoadError";
import { getTechIcon } from "@/lib/techIcons";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import {
  ServiceClientItem,
  getServices,
  getServiceBySlug,
  getServiceWhatsAppUrl
} from "@/lib/api";

interface ServiceDetailViewProps {
  slug: string;
  initialService?: ServiceClientItem | null;
}

export default function ServiceDetailView({ slug, initialService }: ServiceDetailViewProps) {
  const [service, setService] = useState<ServiceClientItem | null>(initialService || null);
  const [allServices, setAllServices] = useState<ServiceClientItem[]>([]);
  const [loading, setLoading] = useState(!initialService);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const autoPlayFromUrl = searchParams?.get("autoplay") === "true";
  const [activeMediaType, setActiveMediaType] = useState<"video" | "image">("image");
  const [isVideoPlaying, setIsVideoPlaying] = useState(autoPlayFromUrl);
  const mediaFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (service || initialService) {
      const current = service || initialService;
      const hasVid = Boolean(current?.video && current.video.trim());
      const isVidFirst = (current?.mediaType === "video" || !current?.mediaType) && hasVid;
      if (autoPlayFromUrl || isVidFirst) {
        setActiveMediaType("video");
        setIsVideoPlaying(autoPlayFromUrl);
      } else {
        setActiveMediaType("image");
      }
    }
  }, [service, initialService, autoPlayFromUrl]);

  useEffect(() => {
    if (autoPlayFromUrl) {
      setActiveMediaType("video");
      setIsVideoPlaying(true);
      const timer = setTimeout(() => {
        mediaFrameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoPlayFromUrl]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);
      const [fetchedService, servicesList] = await Promise.all([
        initialService ? Promise.resolve(initialService) : getServiceBySlug(slug),
        getServices().catch(() => [])
      ]);

      let resolved = fetchedService;
      if (!resolved && Array.isArray(servicesList)) {
        resolved = servicesList.find(
          s => s.slug === slug ||
               s.slug === `${slug}-service` ||
               slug === `${s.slug}-service`
        ) || null;
      }

      if (resolved) {
        setService(resolved);
      } else {
        setError(true);
      }

      if (Array.isArray(servicesList) && servicesList.length > 0) {
        setAllServices(servicesList);
      }
    } catch (err) {
      console.error("Error loading service detail:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, initialService]);

  if (loading) {
    return <UniversalLoader fullScreen size="lg" />;
  }

  if (error || !service) {
    return (
      <div className="bg-slate-50 dark:bg-black text-slate-900 dark:text-white min-h-screen">
        <PageBanner
          title="Service Offering"
          subtitle="Explore our full range of enterprise digital capabilities"
        />
        <div className="max-w-screen-md mx-auto px-4 py-20">
          <DataLoadError
            title="Service Couldn't Load"
            message="We were unable to locate this specific service or retrieve live data from the server. Please check your connection or browse our services catalog."
            onRetry={loadData}
          />
          <div className="text-center mt-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Browse All Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeService = service;

  // Other services for left sidebar navigation (filter out current)
  const otherServices = allServices.filter(
    s => s.slug !== activeService.slug && s._id !== activeService._id
  );
  const sidebarServicesList = otherServices.length > 0 ? otherServices : allServices;
  const hasMoreServices = sidebarServicesList.length > 6;
  const visibleServices = sidebarServicesList.slice(0, 6);

  const heroImage =
    activeService.bannerImage ||
    activeService.image ||
    "/assets/web-CPDVLYNo.jpeg";

  return (
    <div className="bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
      {/* Hero Banner */}
      <PageBanner
        title={activeService.title}
        subtitle={
          activeService.bannerSubtitle ||
          "Custom, scalable, and high-performance digital platforms tailored to your business"
        }
      />

      {/* Main Section - Reduced padding (0.8x) */}
      <section className="bg-slate-50 dark:bg-[#141416] py-10 sm:py-14 transition-colors">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-10">
            {/* Left Sidebar - Reduced spacing (0.8x) & rounded-[4px] */}
            <aside className="w-full lg:w-[32%] space-y-4 shrink-0">
              {/* Other Services Navigation Card */}
              <div className="bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-gray-800 p-5 sm:p-6 rounded-[4px] shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-gray-800 pb-3 flex items-center justify-between">
                  <span>Our Services</span>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-gray-500">{allServices.length} offerings</span>
                </h3>
                <nav className="space-y-2">
                  {visibleServices.map((srv) => (
                    <Link
                      key={srv._id || srv.slug}
                      href={`/services/${srv.slug}`}
                      className="flex justify-between items-center text-slate-700 dark:text-gray-300 py-2 px-2.5 rounded-[4px] hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#0167D6] transition-all border-b border-slate-200/80 dark:border-gray-800/40 group text-xs sm:text-sm"
                    >
                      <span className="font-medium line-clamp-1 group-hover:translate-x-1 transition-transform">
                        {srv.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0167D6] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}

                  {hasMoreServices && (
                    <div className="pt-2">
                      <Link
                        href="/services"
                        className="flex justify-between items-center text-[#0167D6] hover:text-white py-2 px-2.5 rounded-[4px] hover:bg-[#0167D6] transition-all font-semibold text-xs sm:text-sm group border border-[#0167D6]/30 bg-blue-50 dark:bg-[#0167D6]/10"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">See more</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#0167D6] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </nav>
              </div>

              {/* Call Expert & Hire Us Box */}
              <div
                style={{ backgroundImage: "url('/assets/sidebar-phone-D7l_BbZM.webp')" }}
                className="bg-cover bg-center rounded-[4px] p-6 text-center relative overflow-hidden h-[300px] flex flex-col items-center justify-center border dark:border-gray-800 border-slate-200 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/95 via-black/85 to-black/75 z-0" />
                <div className="relative z-10 px-2 w-full">
                  <a
                    href="tel:+8801973590937"
                    className="w-12 h-12 rounded-[4px] bg-red-600 hover:bg-red-500 transition-transform hover:scale-105 flex items-center justify-center text-white mx-auto mb-4 shadow-xl"
                    aria-label="Call Okobiz Experts"
                  >
                    <Phone className="w-6 h-6 text-white" />
                  </a>
                  <p className="text-white text-sm font-semibold mb-1" style={{ color: "#FFFFFF" }}>
                    Need help? Contact our experts
                  </p>
                  <a
                    href="tel:+8801973590937"
                    className="text-lg font-extrabold text-white tracking-wide hover:underline block mb-4"
                    style={{ color: "#FFFFFF" }}
                  >
                    +880 1973-590937
                  </a>

                  {/* Sidebar Hire Us Button */}
                  <a
                    href={getServiceWhatsAppUrl(activeService.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0167D6] hover:bg-[#0055b8] text-white font-bold text-xs uppercase tracking-wider rounded-[4px] transition shadow-lg"
                    style={{ color: "#FFFFFF" }}
                  >
                    <MessageSquare size={14} className="text-white" />
                    <span className="text-white">Hire Us on WhatsApp</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Right Main Content - Reduced spacing & rounded-[4px] */}
            <main className="w-full lg:w-[68%] min-w-0">
              {(() => {
                const allImages: string[] = Array.isArray(activeService.images) && activeService.images.length > 0
                  ? activeService.images
                  : (activeService.thumbnail || activeService.image ? [activeService.thumbnail || activeService.image] : [heroImage]);

                const hasVideo = Boolean(activeService.video && activeService.video.trim());
                const isYt = isYouTubeUrl(activeService.video);
                const ytThumb = isYt ? getYouTubeThumbnailUrl(activeService.video) : null;
                const isCustomImage = (url?: string | null) =>
                  Boolean(url && url.trim() && !url.startsWith("/assets/") && !url.includes("img.youtube.com"));

                const videoPosterThumb =
                  (isCustomImage(activeService.videoThumbnail) ? activeService.videoThumbnail : null) ||
                  (isCustomImage(activeService.thumbnail) ? activeService.thumbnail : null) ||
                  ytThumb ||
                  activeService.videoThumbnail ||
                  activeService.thumbnail ||
                  activeService.image ||
                  allImages[0];

                return (
                  <div>
                    {/* Cover Hero Banner Image / Video Showcase */}
                    <div ref={mediaFrameRef} className="rounded-[4px] overflow-hidden border border-slate-200 dark:border-gray-800 shadow-sm mb-3 bg-black">
                      {activeMediaType === "video" && hasVideo ? (
                        !isVideoPlaying ? (
                          <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center group overflow-hidden">
                            <img
                              src={videoPosterThumb}
                              alt={`${activeService.title} video preview`}
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
                          <div className="aspect-video w-full bg-black">
                            {isYouTubeUrl(activeService.video) ? (
                              <iframe
                                src={getYouTubeEmbedUrl(activeService.video, true) || `${getYouTubeEmbedUrl(activeService.video)}?autoplay=1&rel=0`}
                                title={activeService.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={activeService.video}
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
                        <div className="relative aspect-video w-full overflow-hidden bg-white dark:bg-[#181A1D] flex items-center justify-center">
                          <img
                            src={selectedImage || activeService.thumbnail || activeService.image || heroImage}
                            alt={activeService.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Row if video or multiple images uploaded */}
                    {(hasVideo || allImages.length > 1) && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5">
                        {/* 1. Video Thumbnail */}
                        {hasVideo && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMediaType("video");
                              setIsVideoPlaying(true);
                            }}
                            className={`relative w-20 h-14 rounded-[4px] overflow-hidden border shrink-0 transition-all group ${
                              activeMediaType === "video"
                                ? "border-[#0167D6] ring-2 ring-[#0167D6]"
                                : "border-slate-200 dark:border-gray-800 opacity-70 hover:opacity-100"
                            }`}
                            title="Watch Video"
                          >
                            <img src={videoPosterThumb} alt="Video Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play size={12} fill="white" className="text-white" />
                            </div>
                          </button>
                        )}

                        {/* 2. Photo Gallery Thumbnails */}
                        {allImages.map((imgUrl, i) => {
                          const isCurrent = activeMediaType === "image" && (selectedImage || activeService.thumbnail || activeService.image || heroImage) === imgUrl;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setActiveMediaType("image");
                                setSelectedImage(imgUrl);
                              }}
                              className={`w-20 h-14 rounded-[4px] overflow-hidden border shrink-0 transition-all ${
                                isCurrent
                                  ? "border-[#0167D6] ring-2 ring-[#0167D6]/40"
                                  : "border-slate-200 dark:border-gray-800 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Service Full Narrative Description */}
              <div className="mb-5">
                {activeService.fullDesc ? (
                  <div
                    className="text-slate-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed text-justify space-y-3.5 prose dark:prose-invert max-w-none [&_p]:mb-3.5 [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_h2]:text-lg sm:[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#0167D6] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-gray-400 [&_a]:text-[#0167D6] [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: activeService.fullDesc }}
                  />
                ) : (
                  <p className="text-slate-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed text-justify">
                    {activeService.shortDesc}
                  </p>
                )}
              </div>

              {/* PROMINENT HIRE US CALL TO ACTION BOX */}
              <div className="dark:bg-gradient-to-r dark:from-[#0167D6]/20 dark:via-[#181A1D] dark:to-[#181A1D] dark:border-[#0167D6]/50 bg-gradient-to-r from-blue-50/90 via-white to-white border border-blue-200 p-5 sm:p-6 rounded-[4px] mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[#0167D6] uppercase tracking-wider">
                      Ready to Start Your Project?
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold dark:text-white text-slate-900">
                    Hire Us for {activeService.title}
                  </h4>
                  <p className="text-xs dark:text-gray-400 text-slate-600 mt-1">
                    Get an instant quote, technical consultation, and project timeline with our senior team.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <a
                    href={getServiceWhatsAppUrl(activeService.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0167D6] hover:bg-[#0055b8] text-white font-bold text-xs uppercase tracking-wider rounded-[4px] transition shadow-lg shadow-blue-900/40"
                  >
                    <MessageSquare size={14} />
                    <span>Hire Us</span>
                  </a>
                  <a
                    href="tel:+8801973590937"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:hover:text-white dark:border-gray-700/80 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs font-semibold text-xs rounded-[4px] transition"
                  >
                    <Phone size={13} />
                    <span>Call Now</span>
                  </a>
                </div>
              </div>

              {/* Why Choose Us Checklist Card */}
              {activeService.whyChooseUs && activeService.whyChooseUs.length > 0 && (
                <div className="bg-white dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800 rounded-[4px] p-5 sm:p-6 mb-5 shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#0167D6]" />
                    <span>Why Choose Us?</span>
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-gray-300">
                    {activeService.whyChooseUs.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0167D6] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 dark:text-white font-semibold">{item.title}:</strong>{" "}
                          <span className="text-slate-600 dark:text-gray-300 leading-relaxed">{item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technology Frameworks & Tools Badges */}
              {activeService.techStack && activeService.techStack.length > 0 && (
                <div className="border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#181A1D] rounded-[4px] p-5 sm:p-6 mb-5 shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-[#0167D6]" />
                    <span>Technology Frameworks & Tools</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mb-4">
                    Industry-leading tools and architectures leveraged to build high-performance solutions.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {activeService.techStack.map((tech, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] bg-slate-50 dark:bg-[#141416] border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 text-xs font-semibold shadow-2xs hover:border-[#0167D6] hover:text-[#0167D6] transition group"
                      >
                        <span className="text-[#0167D6] shrink-0 group-hover:scale-110 transition-transform">
                          {getTechIcon(tech, "w-4 h-4 text-[#0167D6]")}
                        </span>
                        <span>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* FULL SECTION: EDITABLE PRICING PACKAGES LIKE PRODUCTS PAGE */}
      {activeService.pricingPlans && activeService.pricingPlans.length > 0 && (
        <section className="py-16 sm:py-20 dark:bg-[#0E0F12] bg-[#F4F6F9] border-t dark:border-gray-800/80 border-slate-200">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0167D6] px-3.5 py-1 bg-[#0167D6]/10 dark:bg-[#0167D6]/20 rounded-[4px] inline-block mb-3 border border-[#0167D6]/30">
                Transparent & Predictable Pricing
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold dark:text-white text-slate-900">
                Choose the Ideal Plan for {activeService.title}
              </h2>
              <p className="mt-3 text-sm dark:text-gray-400 text-slate-600 leading-relaxed">
                All plans include dedicated senior engineer oversight, milestone reviews, and post-delivery support. Select a package below to order or chat with our team on WhatsApp.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {activeService.pricingPlans.map((plan, idx) => {
                const planWhatsappUrl = getServiceWhatsAppUrl(activeService.title, undefined, plan.name);
                const hasDiscount = plan.discountPrice && plan.discountPrice > plan.price;
                const savingsPct = hasDiscount
                  ? Math.round(((plan.discountPrice - plan.price) / plan.discountPrice) * 100)
                  : 0;

                return (
                  <div
                    key={idx}
                    className={`relative rounded-[4px] p-7 flex flex-col justify-between transition-all duration-300 ${
                      plan.isPopular
                        ? "dark:bg-[#181A1E] bg-white border-2 border-[#0167D6] shadow-xl dark:shadow-blue-900/30 shadow-blue-500/10 scale-[1.02] z-10"
                        : "dark:bg-[#111215] bg-white border dark:border-gray-800 border-slate-200 hover:border-slate-300 shadow-md"
                    }`}
                  >
                    {/* Popular Ribbon */}
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0167D6] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-[4px] uppercase tracking-wider shadow-lg">
                        ⭐ Most Popular Choice
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-extrabold dark:text-white text-slate-900">
                          {plan.name}
                        </h3>
                        {plan.badge && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-[4px] dark:bg-gray-800 dark:text-gray-300 bg-slate-100 text-slate-700 border dark:border-gray-700 border-slate-200">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs dark:text-gray-400 text-slate-600 min-h-[36px] mb-6">
                        {plan.description || "Comprehensive service scope designed for maximum ROI and delivery excellence."}
                      </p>

                      {/* Pricing block */}
                      <div className="pb-6 mb-6 border-b dark:border-gray-800/80 border-slate-200">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900">
                            ৳{plan.price?.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm dark:text-gray-500 text-slate-400 line-through">
                              ৳{plan.discountPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs dark:text-gray-400 text-slate-500">
                            {plan.period || "One-Time Setup"}
                          </span>
                          {savingsPct > 0 && (
                            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-[4px] border border-emerald-200 dark:border-transparent">
                              Save {savingsPct}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 mb-8">
                        <p className="text-[11px] font-bold dark:text-gray-400 text-slate-500 uppercase tracking-wider">
                          Included Deliverables:
                        </p>
                        <ul className="space-y-2.5">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5 text-xs dark:text-gray-300 text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
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
                          ? "bg-[#0167D6] hover:bg-[#0055b8] text-white shadow-blue-900/40"
                          : "dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white bg-slate-100 hover:bg-[#0167D6] text-slate-800 hover:text-white border border-slate-300 hover:border-[#0167D6]"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Select {plan.name} Package</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Talk With Us CTA */}
      <TalkCta />
    </div>
  );
}
