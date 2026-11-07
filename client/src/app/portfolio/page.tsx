"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  Play,
  ArrowRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Video,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import { PortfolioProject } from "@/data/mockData";
import { getThemes, getPortfolioPdf, PortfolioPdfData } from "@/lib/api";
import { isYouTubeUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { stripMarkdown } from "@/lib/richText";
import { createSlug } from "@/lib/slug";

const ITEMS_PER_PAGE = 12;

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [pdfData, setPdfData] = useState<PortfolioPdfData>({
    heading: "okobiz Official Profile & Credentials 2024",
    subheading: "Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)",
    pdfUrl: "/assets/okobiz_profile-DvU1SuUS.pdf",
    badge: ""
  });

  useEffect(() => {
    const fetchLiveProjects = async () => {
      try {
        const themes = await getThemes();
        if (Array.isArray(themes) && themes.length > 0) {
          const formatted: PortfolioProject[] = themes.map((t: any) => ({
            _id: t._id,
            slug: t.slug || createSlug(t.websiteTitle || t.title || "Project"),
            title: t.websiteTitle || t.title || "Project",
            category: t.category || "Web Applications",
            clientName: t.clientName || "Enterprise Client",
            completionYear: "2024",
            mediaType: t.mediaType || (t.video ? "video" : "image"),
            thumbnail: t.photo || (isYouTubeUrl(t.video) ? getYouTubeThumbnailUrl(t.video) : "") || "https://res.cloudinary.com/dccui8s58/image/upload/v1790852858/okobiz/assets/bdhajj-D468QQtK.png",
            videoUrl: t.video || "",
            videoThumbnail: t.videoThumbnail || (isYouTubeUrl(t.video) ? getYouTubeThumbnailUrl(t.video) : "") || t.photo || "",
            liveUrl: t.websiteLink || "",
            shortDescription: t.description || "",
            fullDescription: t.description || "",
            challenge: t.challenge || "",
            solution: t.solution || "",
            features: t.features || [],
            techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
            results: ["Production Deployed", "High Performance Architecture"],
            isFeatured: Boolean(t.featuredBadge || t.popularBadge)
          }));
          setProjects(formatted);
        }
      } catch (e) {
        console.warn("Failed to fetch live projects:", e);
      }
    };

    const fetchPdf = async () => {
      try {
        const data = await getPortfolioPdf();
        if (data) setPdfData(data);
      } catch (err) {
        console.warn("Failed to load portfolio PDF data:", err);
      }
    };

    fetchLiveProjects();
    fetchPdf();
  }, []);

  const categories = [
    "All",
    "Web Applications",
    "Mobile & SaaS",
    "E-Commerce",
    "Corporate Systems"
  ];

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const target = document.getElementById("portfolio-grid-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-black text-slate-900 dark:text-white min-h-screen">
      <PageBanner
        title="Our Portfolio"
        subtitle="Official okobiz credentials, completed case studies, and engineering capabilities"
      />

      <section id="portfolio-grid-section" className="py-16 md:py-20 bg-white dark:bg-[#121316]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          {/* Top Quick Bar: Download Official Company Profile PDF (4px radius) */}
          <div className="bg-slate-50 dark:bg-[#181A1E] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 mb-16 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs dark:shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[4px] bg-blue-50 dark:bg-[#3368B2]/20 border border-blue-200 dark:border-[#3368B2]/40 flex items-center justify-center text-[#0167D6] dark:text-[#3368B2] shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {pdfData.heading}
                  {pdfData.badge && pdfData.badge.trim() && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-[4px] text-[10px] bg-green-500/20 text-emerald-600 dark:text-green-400 font-bold">
                      {pdfData.badge}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
                  {pdfData.subheading}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a
                href={`/api/pdf?url=${encodeURIComponent(pdfData.pdfUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-white rounded-[4px] text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-300 dark:border-transparent"
              >
                <span>View PDF</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`/api/pdf?url=${encodeURIComponent(pdfData.pdfUrl)}&download=1`}
                className="px-5 py-2.5 bg-[#0167D6] hover:bg-blue-600 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-md shadow-blue-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>

          {/* Section Header: Already Done Projects */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="font-bold text-[#0167D6] dark:text-[#0077FF] text-xs sm:text-sm uppercase tracking-widest inline-block mb-3">
              - OUR WORK & CASE STUDIES -
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Featured Completed Projects
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
              Explore our track record of already delivered high-performance web applications, enterprise SaaS platforms, mobile ecosystems, and interactive video experiences.
            </p>
          </div>

          {/* Category Filter Pills (4px radius) */}
          <div className="flex justify-center flex-wrap gap-2.5 mb-14">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-xs font-bold px-5 py-2.5 rounded-[4px] transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[#0167D6] text-white shadow-md shadow-blue-500/20 border border-[#0167D6]"
                    : "bg-slate-100 dark:bg-[#181A1E] border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Completed Projects Grid with 2px radius in all boxes */}
          {paginatedProjects.length === 0 ? (
            <div className="bg-[#16171B] border border-gray-800 rounded-[2px] p-12 text-center text-gray-400 text-sm">
              No projects found in category <span className="text-white font-semibold">{selectedCategory}</span>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedProjects.map((project) => {
                const isVideo = project.mediaType === "video" || !!project.videoUrl;
                const isYt = isYouTubeUrl(project.videoUrl);
                const rawImage =
                  (project.videoThumbnail && project.videoThumbnail.trim()) ||
                  (isYt ? getYouTubeThumbnailUrl(project.videoUrl) : null) ||
                  (project.thumbnail && project.thumbnail.trim()) ||
                  "/assets/bdhajj-D468QQtK.png";
                const displayImage = rawImage || "/assets/bdhajj-D468QQtK.png";

                return (
                  <div
                    key={project._id}
                    className="bg-white dark:bg-[#16171B] border border-slate-200 dark:border-gray-800/90 rounded-[4px] overflow-hidden hover:border-[#0167D6] transition-all duration-300 flex flex-col justify-between group shadow-xs hover:shadow-xl hover:shadow-blue-900/10"
                  >
                    <div>
                      {/* Media Preview Box */}
                      <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100 dark:bg-black rounded-t-[4px]">
                        <img
                          src={displayImage}
                          alt={project.title}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes("bdhajj-D468QQtK")) {
                              target.src = "/assets/bdhajj-D468QQtK.png";
                            }
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Subtle Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                        {/* Top Badges (4px radius) */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                          <span className="px-3 py-1 rounded-[4px] bg-[#0167D6] text-white text-[11px] font-bold shadow-md">
                            {project.category}
                          </span>

                          {isVideo && (
                            <span className="px-2.5 py-1 rounded-[4px] bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-lg">
                              <Video size={12} /> Video Case
                            </span>
                          )}
                        </div>

                        {/* Media Cover Link - if video, clicking frame triggers autoplay */}
                        <Link
                          href={
                            isVideo
                              ? `/portfolio/${project.slug || project._id}?autoplay=true`
                              : `/portfolio/${project.slug || project._id}`
                          }
                          className="absolute inset-0 z-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                          title={isVideo ? "Watch Video Case Study" : project.title}
                        >
                          {isVideo && (
                            <div className="w-14 h-14 rounded-full bg-[#0167D6] hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 backdrop-blur-md border-2 border-white/70 group-hover:scale-110 transition-transform duration-300">
                              <Play size={24} fill="white" className="ml-1 text-white" />
                            </div>
                          )}
                        </Link>

                        {/* Bottom Client Tag */}
                        <div className="absolute bottom-3 left-3.5 text-xs text-white/95 font-semibold flex items-center gap-2 drop-shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>{project.clientName}</span>
                          <span className="text-white/60">•</span>
                          <span className="text-white/80">{project.completionYear}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <Link href={`/portfolio/${project.slug || project._id}`}>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#0167D6] transition-colors mb-2.5 line-clamp-1">
                            {project.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                          {stripMarkdown(project.shortDescription)}
                        </p>

                        {/* Tech Stack Tags (4px radius) */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.techStack.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2.5 py-0.5 rounded-[4px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 font-medium">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom Actions */}
                    <div className="p-6 pt-0 border-t border-slate-100 dark:border-gray-800/80 mt-2 flex items-center justify-between">
                      <Link
                        href={`/portfolio/${project.slug || project._id}`}
                        className="text-xs font-bold text-[#0167D6] hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Explore Details</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>Live Site</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Navigation (12 items per page) */}
          {filteredProjects.length > 0 && (
            <div className="mt-14 pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400 font-medium">
                Showing <span className="text-white font-bold">{Math.min(filteredProjects.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> to{" "}
                <span className="text-white font-bold">{Math.min(filteredProjects.length, currentPage * ITEMS_PER_PAGE)}</span> of{" "}
                <span className="text-white font-bold">{filteredProjects.length}</span> portfolio items
              </p>

              {totalPages > 1 && (
                <nav aria-label="Portfolio pagination" className="flex items-center gap-1.5">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-[2px] text-xs font-medium bg-[#16171B] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-[2px] text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-[#3368B2] text-white border border-[#3368B2] shadow-md shadow-blue-900/40"
                          : "bg-[#16171B] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-[2px] text-xs font-medium bg-[#16171B] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </nav>
              )}
            </div>
          )}
        </div>
      </section>

      <TalkCta />
    </div>
  );
}
