"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Building,
  CheckCircle,
  Play,
  Layers,
  Sparkles,
  TrendingUp,
  Share2,
  Cpu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import UniversalLoader from "@/components/UniversalLoader";
import DataLoadError from "@/components/DataLoadError";
import { PortfolioProject } from "@/data/mockData";
import { getThemes } from "@/lib/api";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { renderRichText } from "@/lib/richText";
import { createSlug } from "@/lib/slug";
import { getTechIcon } from "@/lib/techIcons";

function PortfolioDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const autoPlayFromUrl = searchParams?.get("autoplay") === "true";

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlayFromUrl);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mediaFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams?.get("autoplay") === "true" || autoPlayFromUrl) {
      setIsPlaying(true);
      const timer = setTimeout(() => {
        mediaFrameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [searchParams, autoPlayFromUrl]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(false);
      const themes = await getThemes();
      if (Array.isArray(themes)) {
        const cleanId = id.toLowerCase();
        const match = themes.find(
          (p: any) =>
            p._id === id ||
            (p.slug && p.slug.toLowerCase() === cleanId) ||
            createSlug(p.websiteTitle || p.title || "") === cleanId
        );
        if (match) {
          const rawImages = Array.isArray(match.images) && match.images.length > 0
            ? match.images
            : (match.photo ? [match.photo] : []);

          setProject({
            _id: match._id,
            slug: match.slug || createSlug(match.websiteTitle || match.title || ""),
            title: match.websiteTitle || match.title,
            category: match.category || "Web Applications",
            clientName: match.clientName || "Enterprise Client",
            completionYear: "2024",
            mediaType: match.mediaType || (match.video ? "video" : "image"),
            thumbnail: match.photo || (rawImages[0] || "/assets/bdhajj-D468QQtK.png"),
            images: rawImages,
            videoUrl: match.video || "",
            videoThumbnail: match.videoThumbnail || match.photo || "",
            liveUrl: match.websiteLink || "",
            shortDescription: match.description || "",
            fullDescription: match.description || "",
            challenge: match.challenge || "",
            solution: match.solution || "",
            features: match.features || [],
            techStack: (Array.isArray(match.techStack) && match.techStack.length > 0)
              ? match.techStack
              : ["Next.js", "TypeScript", "Tailwind CSS", "MongoDB"],
            results: ["High Performance Scalability", "99.9% Uptime Verified"]
          });
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (e) {
      console.warn("Failed to load project details:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return <UniversalLoader fullScreen size="lg" />;
  }

  if (error || !project) {
    return (
      <div className="bg-[#F8FAFC] dark:bg-black text-slate-900 dark:text-white min-h-screen">
        <PageBanner title="Portfolio Details" subtitle="Project case study and architectural overview" />
        <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center">
          <DataLoadError
            title="Project Couldn't Load"
            message="The requested portfolio project could not be found or failed to load from the server."
            onRetry={fetchProject}
          />
          <Link
            href="/portfolio"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-slate-200 dark:bg-gray-800 text-slate-800 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-gray-700 text-xs font-semibold transition"
          >
            <ArrowLeft size={14} /> Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const isVideo = project.mediaType === "video" || !!project.videoUrl;
  const isYt = isYouTubeUrl(project.videoUrl);
  const ytEmbedUrl = isYt ? getYouTubeEmbedUrl(project.videoUrl, isPlaying) : null;
  const rawPoster =
    (project.videoThumbnail && project.videoThumbnail.trim()) ||
    (isYt ? getYouTubeThumbnailUrl(project.videoUrl) : null) ||
    (project.thumbnail && project.thumbnail.trim()) ||
    "/assets/bdhajj-D468QQtK.png";
  const displayPoster = rawPoster || "/assets/bdhajj-D468QQtK.png";
  const projectImages = Array.isArray(project.images) && project.images.length > 0
    ? project.images
    : [displayPoster];
  const currentScreenshot = projectImages[activeImageIndex] || displayPoster;

  return (
    <div className="bg-[#F8FAFC] dark:bg-black text-slate-900 dark:text-white min-h-screen">
      <PageBanner
        title={project.title}
        subtitle={`Case Study • ${project.category} • Delivered for ${project.clientName}`}
      />

      <article className="py-16 md:py-24 bg-white dark:bg-[#121316]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          {/* Back button and quick actions */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-200 dark:border-gray-800">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-gray-400 hover:text-[#0167D6] dark:hover:text-white transition group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Portfolio</span>
            </Link>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
              >
                <span>Live Project Demo</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Project Meta Details Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-[#16171B] border border-slate-200 dark:border-gray-800 rounded-[4px] mb-12 shadow-xs dark:shadow-xl">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-gray-500 uppercase tracking-wider font-bold">Client</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                <Building size={14} className="text-[#0167D6] dark:text-[#3368B2]" />
                {project.clientName}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-gray-500 uppercase tracking-wider font-bold">Category</p>
              <p className="text-sm font-bold text-[#0167D6] dark:text-[#3368B2] mt-1">{project.category}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-gray-500 uppercase tracking-wider font-bold">Delivered In</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400 dark:text-gray-400" />
                {project.completionYear}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-gray-500 uppercase tracking-wider font-bold">Media Type</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {isVideo ? (isYt ? "YouTube Video Case" : "Video Case Study") : "Web Showcase"}
              </p>
            </div>
          </div>

          {/* Media Showcase: YouTube Iframe, HTML5 Video, or Image - Elegantly Scaled & Centered */}
          <div ref={mediaFrameRef} className="max-w-4xl lg:max-w-5xl mx-auto mb-14 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-black shadow-2xl relative aspect-[16/9] max-h-[460px] md:max-h-[500px] flex items-center justify-center">
            {isVideo && project.videoUrl ? (
              !isPlaying ? (
                /* Paused state when user clicked outside video play frame */
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center group overflow-hidden">
                  <img
                    src={displayPoster}
                    alt={project.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("bdhajj-D468QQtK")) {
                        target.src = "/assets/bdhajj-D468QQtK.png";
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
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
                /* Autoplaying state when user clicked video play button */
                isYt && ytEmbedUrl ? (
                  <div className="relative w-full h-full bg-black">
                    <iframe
                      src={ytEmbedUrl}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={project.videoUrl}
                      poster={displayPoster}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                )
              )
            ) : (
              <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-gray-950 flex items-center justify-center p-3 sm:p-5">
                <img
                  src={currentScreenshot}
                  alt={project.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes("bdhajj-D468QQtK")) {
                      target.src = "/assets/bdhajj-D468QQtK.png";
                    }
                  }}
                  className="w-full h-full object-contain max-h-[460px] md:max-h-[500px] transition-all duration-300 rounded-[4px]"
                />

                {projectImages.length > 1 && (
                  <>
                    <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-gray-200 text-[11px] font-bold px-2.5 py-1 rounded-[4px] border border-gray-700">
                      Screenshot {activeImageIndex + 1} of {projectImages.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? projectImages.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[4px] bg-black/70 hover:bg-black text-white flex items-center justify-center transition border border-gray-700 cursor-pointer"
                      aria-label="Previous Screenshot"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === projectImages.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[4px] bg-black/70 hover:bg-black text-white flex items-center justify-center transition border border-gray-700 cursor-pointer"
                      aria-label="Next Screenshot"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Strip when Multiple Screenshots Exist */}
          {!isVideo && projectImages.length > 1 && (
            <div className="max-w-4xl lg:max-w-5xl mx-auto -mt-10 mb-14 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {projectImages.map((img: string, idx: number) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-[4px] overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                      isActive
                        ? "border-[#0167D6] ring-2 ring-blue-500/30 scale-105"
                        : "border-slate-300 dark:border-gray-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Project Narrative */}
          <div className="space-y-12">
            {/* Overview */}
            <div>
              <span className="text-[#0167D6] dark:text-[#0077FF] text-xs font-bold uppercase tracking-widest block mb-2">
                - Overview -
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
                Executive Summary
              </h2>
              <div className="text-slate-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed space-y-4 prose dark:prose-invert max-w-none">
                {project.fullDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: renderRichText(project.fullDescription) }} />
                ) : (
                  <p>{project.shortDescription}</p>
                )}
              </div>
            </div>

            {/* Challenge & Solution Grid */}
            {(project.challenge || project.solution) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-gray-800">
                {project.challenge && (
                  <div className="bg-slate-50 dark:bg-[#16171B] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800/80 shadow-xs">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      The Architectural Challenge
                    </h3>
                    <div className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed text-justify">
                      <div dangerouslySetInnerHTML={{ __html: renderRichText(project.challenge) }} />
                    </div>
                  </div>
                )}

                {project.solution && (
                  <div className="bg-slate-50 dark:bg-[#16171B] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800/80 shadow-xs">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0167D6]"></span>
                      Our Engineered Solution
                    </h3>
                    <div className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed text-justify">
                      <div dangerouslySetInnerHTML={{ __html: renderRichText(project.solution) }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key Features List */}
            {project.features && project.features.length > 0 && (
              <div className="pt-6 border-t border-slate-200 dark:border-gray-800">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#0167D6] dark:text-[#3368B2]" />
                  Delivered Features & Technical Milestones
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.features.map((feat: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-[4px] bg-slate-50 dark:bg-[#16171B] border border-slate-200 dark:border-gray-800/60 text-xs sm:text-sm text-slate-700 dark:text-gray-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0167D6] dark:bg-[#3368B2] mt-1.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technology Stack Grid */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="pt-6 border-t border-slate-200 dark:border-gray-800">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Cpu size={18} className="text-[#0167D6]" />
                  Technology Frameworks & Tools
                </h3>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {project.techStack.map((tech: string, idx: number) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] bg-slate-50 dark:bg-[#16171B] border border-slate-200 dark:border-gray-800 text-xs font-semibold text-slate-800 dark:text-gray-200 shadow-2xs hover:border-[#0167D6] hover:text-[#0167D6] transition group"
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
          </div>
        </div>
      </article>

      {/* Talk CTA */}
      <TalkCta />
    </div>
  );
}

export default function PortfolioDetailPage() {
  return (
    <Suspense fallback={<UniversalLoader fullScreen size="lg" />}>
      <PortfolioDetailContent />
    </Suspense>
  );
}
