"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Search,
  ExternalLink,
  ImageIcon,
  Video,
  Star,
  Play,
  Check,
  FileText,
  UploadCloud,
  CheckCircle2,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { isYouTubeUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { cleanSnippet } from "@/lib/richText";
import { Textarea } from "@/components/ui/textarea";

const ITEMS_PER_PAGE = 12;

export default function PortfolioThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Portfolio PDF Section State
  const [pdfForm, setPdfForm] = useState({
    heading: "okobiz Official Profile & Credentials 2024",
    subheading: "Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)",
    pdfUrl: "/assets/okobiz_profile-DvU1SuUS.pdf",
    badge: "",
  });
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [pdfSavedSuccess, setPdfSavedSuccess] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const fetchThemes = async () => {
    try {
      const res = await fetch("/api/themes");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setThemes(data.data);
      }
    } catch (e) {
      console.warn("Failed to fetch themes:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPdfSettings = async () => {
    try {
      const res = await fetch("/api/portfolio-pdf");
      const data = await res.json();
      if (data.success && data.data) {
        setPdfForm({
          heading: data.data.heading || "okobiz Official Profile & Credentials 2024",
          subheading: data.data.subheading || "Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)",
          pdfUrl: data.data.pdfUrl || "/assets/okobiz_profile-DvU1SuUS.pdf",
          badge: data.data.badge || "",
        });
      }
    } catch (e) {
      console.warn("Failed to fetch portfolio PDF settings:", e);
    } finally {
      setLoadingPdf(false);
    }
  };

  useEffect(() => {
    fetchThemes();
    fetchPdfSettings();
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF document (.pdf only).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("PDF file size must be less than 20MB.");
      return;
    }

    setUploadingPdf(true);
    try {
      const previousPdfUrl = pdfForm.pdfUrl;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success && data.url) {
        if (previousPdfUrl && previousPdfUrl.includes("res.cloudinary.com")) {
          fetch(`/api/upload?url=${encodeURIComponent(previousPdfUrl)}`, { method: "DELETE" }).catch(() => {});
        }
        setPdfForm((prev) => ({ ...prev, pdfUrl: data.url }));
        alert("PDF uploaded successfully! Click 'Save & Publish Live' below to commit changes.");
      } else {
        alert(data.error || "Failed to upload PDF. Please try again.");
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      alert("Failed to upload PDF to cloud.");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSavePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPdf(true);
    setPdfSavedSuccess(false);

    try {
      const res = await fetch("/api/portfolio-pdf", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfForm),
      });
      const data = await res.json();

      if (data.success) {
        setPdfSavedSuccess(true);
        setTimeout(() => setPdfSavedSuccess(false), 5000);
      } else {
        alert(data.message || "Failed to save portfolio PDF settings.");
      }
    } catch (err) {
      console.error("PDF settings save error:", err);
      alert("Failed to save PDF settings.");
    } finally {
      setSavingPdf(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? Its images and videos will also be permanently deleted from cloud storage.")) return;
    try {
      await fetch(`/api/themes?id=${id}`, { method: "DELETE" });
      fetchThemes();
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project");
    }
  };

  const filtered = themes.filter(
    (t) =>
      t.websiteTitle?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="text-[#3368B2]" size={24} />
            Portfolio Projects &amp; Case Studies
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Manage completed projects, client showcase works, video showcases, and credentials PDF
          </p>
        </div>
        <Link
          href="/dashboard/portfolio/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition cursor-pointer"
        >
          <Plus size={16} /> Add New Project
        </Link>
      </div>

      {/* Portfolio PDF Download Section Management */}
      <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-blue-50 dark:bg-[#3368B2]/20 border border-blue-200 dark:border-[#3368B2]/40 flex items-center justify-center text-[#0167D6] dark:text-[#3368B2]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Portfolio PDF Section
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Edit the heading, subheading, and company credentials PDF file shown at the top of the client portfolio page.
              </p>
            </div>
          </div>

          {pdfSavedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-emerald-50 dark:bg-green-500/20 border border-emerald-200 dark:border-green-500/40 text-emerald-700 dark:text-green-400 text-xs font-semibold animate-pulse">
              <CheckCircle2 size={14} />
              <span>Saved and published live!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSavePdf} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={pdfForm.heading}
                onChange={(e) => setPdfForm({ ...pdfForm, heading: e.target.value })}
                placeholder="e.g. okobiz Official Profile & Credentials 2024"
                className="w-full bg-white dark:bg-[#181A1E] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Badge Tag Text
              </label>
              <input
                type="text"
                value={pdfForm.badge}
                onChange={(e) => setPdfForm({ ...pdfForm, badge: e.target.value })}
                placeholder="e.g. VERIFIED"
                className="w-full bg-white dark:bg-[#181A1E] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Subheading Description
              </label>
              <Textarea
                value={pdfForm.subheading}
                onChange={(e) => setPdfForm({ ...pdfForm, subheading: e.target.value })}
                rows={2}
                placeholder="Brief document description (e.g. Corporate capabilities brochure...)"
                className="w-full bg-white dark:bg-[#181A1E] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#181A1E] border border-slate-200 dark:border-gray-800/80 rounded-[4px] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-[4px] bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="truncate max-w-[280px] sm:max-w-md">{pdfForm.pdfUrl || "No file uploaded"}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                  PDF format • Max file size 20MB • Cloud Storage
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
              />

              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploadingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-white dark:bg-[#1F2228] border border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-500 text-xs font-semibold text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-50 cursor-pointer"
              >
                {uploadingPdf ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                <span>{uploadingPdf ? "Uploading..." : "Replace PDF File"}</span>
              </button>

              {pdfForm.pdfUrl && (
                <a
                  href={pdfForm.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <Download size={13} />
                  <span>Download / Preview</span>
                </a>
              )}

              <button
                type="submit"
                disabled={savingPdf || uploadingPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-md shadow-blue-900/20"
              >
                {savingPdf ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>{savingPdf ? "Saving..." : "Save & Publish Live"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search projects, client, or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#181A1E] border border-slate-300 dark:border-gray-800 rounded-[4px] pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-gray-400 font-medium">
          Total Projects: <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3368B2]" />
          Loading portfolio projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#131417] border border-gray-800 rounded-[4px] p-12 text-center text-gray-400 text-sm">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-white">No projects found</p>
          <p className="text-xs text-gray-500 mt-1 mb-5">Click below to add your first portfolio showcase</p>
          <Link
            href="/dashboard/portfolio/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] bg-[#3368B2] text-white text-xs font-bold"
          >
            <Plus size={14} /> Add Project
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {paginatedItems.map((item) => {
              const isVideo = item.mediaType === "video" || Boolean(item.video);
              const previewThumb = isVideo
                ? (item.videoThumbnail || (isYouTubeUrl(item.video) ? getYouTubeThumbnailUrl(item.video) : "") || item.photo || "/assets/bdhajj-D468QQtK.png")
                : (item.photo || "/assets/bdhajj-D468QQtK.png");

              return (
                <div
                  key={item._id}
                  className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[6px] overflow-hidden group hover:border-[#0167D6] dark:hover:border-[#3368B2]/60 transition shadow-xs hover:shadow-md flex flex-col justify-between h-[355px]"
                >
                  {/* Media Thumbnail (Fixed aspect-video / 190px matching Services & Products) */}
                  <div className="h-[190px] aspect-video w-full bg-slate-100 dark:bg-black relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={previewThumb}
                      alt={item.websiteTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e: any) => {
                        e.target.src = "/assets/bdhajj-D468QQtK.png";
                      }}
                    />

                    {/* Video or Image badge overlay */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {isVideo ? (
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

                      {item.featuredBadge && (
                        <span className="px-2.5 py-0.5 rounded-[4px] bg-amber-500 text-white text-white-always text-[10px] font-bold flex items-center gap-1 shadow-sm border border-amber-400/40">
                          <Star size={10} className="fill-white text-white text-white-always" />
                          <span className="text-white text-white-always">FEATURED</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2.5 py-0.5 rounded-[4px] bg-white/95 dark:bg-black/75 text-slate-800 dark:text-gray-200 backdrop-blur-md text-[10px] font-mono font-semibold border border-slate-300/80 dark:border-white/15 shadow-sm">
                        {item.category || "Web App"}
                      </span>
                    </div>
                  </div>

                  {/* Content Body (Flexible container with guaranteed min-height snippet) */}
                  <div className="p-4 flex-1 flex flex-col justify-between min-h-0 space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400">
                        <span className="font-medium text-slate-600 dark:text-gray-300 truncate max-w-[150px]">
                          {item.clientName || "Proprietary Project"}
                        </span>
                        {item.price > 0 && (
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ৳ {item.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0167D6] transition">
                        {item.websiteTitle}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {cleanSnippet(item.description, 260) || (
                          <span className="italic text-slate-400 dark:text-gray-600">No project description provided</span>
                        )}
                      </p>
                    </div>

                    {/* Tech Stack Chips */}
                    {Array.isArray(item.techStack) && item.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-100 dark:border-gray-800/60">
                        {item.techStack.slice(0, 3).map((tech: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-800"
                          >
                            {tech}
                          </span>
                        ))}
                        {item.techStack.length > 3 && (
                          <span className="text-[10px] px-1 py-0.5 text-slate-400 dark:text-gray-500">
                            +{item.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions (Fixed height h-[52px]) */}
                  <div className="p-3.5 bg-slate-50/80 dark:bg-[#181A1F]/80 border-t border-slate-200 dark:border-gray-800/80 flex items-center justify-between shrink-0 h-[52px]">
                    {item.websiteLink ? (
                      <a
                        href={item.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0167D6] dark:text-[#3368B2] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Live Preview</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-gray-500 font-medium">Case Study</span>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/portfolio/${item._id}/edit`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-slate-100 dark:bg-white/5 hover:bg-[#0167D6] hover:text-white text-slate-700 dark:text-gray-300 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-transparent transition"
                        title="Edit Project"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-[4px] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-transparent transition cursor-pointer"
                        title="Delete Project (Purges cloud assets)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 12 items pagination bar */}
          {filtered.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Showing <span className="text-slate-900 dark:text-white font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="text-slate-900 dark:text-white font-semibold">{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)}</span> of{" "}
                <span className="text-slate-900 dark:text-white font-semibold">{filtered.length}</span> projects
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={13} />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-7 h-7 rounded-[4px] text-xs font-bold transition ${
                        currentPage === p
                          ? "bg-[#0167D6] text-white border border-[#0167D6]"
                          : "bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <span>Next</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
