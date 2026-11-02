"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Search,
  ExternalLink,
  ImageIcon,
  Video,
  X,
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
import RichTextEditor from "@/components/RichTextEditor";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { cleanSnippet } from "@/lib/richText";
import { createSlug } from "@/lib/slug";

const ITEMS_PER_PAGE = 12;

export default function PortfolioThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Form State (no default data for new projects)
  const [form, setForm] = useState({
    websiteTitle: "",
    slug: "",
    category: "Web Applications",
    clientName: "",
    mediaType: "image", // "image" | "video"
    price: 0,
    discountPrice: 0,
    websiteLink: "",
    photo: "",
    video: "",
    videoThumbnail: "",
    youtubeUrl: "",
    popularBadge: false,
    featuredBadge: false,
    description: "",
    challenge: "",
    solution: "",
    featuresText: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingVideoThumb, setUploadingVideoThumb] = useState(false);

  // Hidden file input refs for clean upload buttons
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const videoThumbInputRef = useRef<HTMLInputElement | null>(null);

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

  const fetchPdfSettings = async () => {
    try {
      const res = await fetch("/api/portfolio-pdf");
      const data = await res.json();
      if (data.success && data.data) {
        setPdfForm({
          heading: data.data.heading || "okobiz Official Profile & Credentials 2024",
          subheading: data.data.subheading || "Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)",
          pdfUrl: data.data.pdfUrl || "/assets/okobiz_profile-DvU1SuUS.pdf",
          badge: data.data.badge !== undefined ? data.data.badge : "",
        });
      }
    } catch (e) {
      console.warn("Failed to fetch portfolio PDF settings:", e);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      alert("Please upload a valid PDF document (.pdf)");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("PDF exceeds the 50MB upload limit.");
      return;
    }

    const previousPdfUrl = pdfForm.pdfUrl;

    setUploadingPdf(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (previousPdfUrl && !previousPdfUrl.includes("okobiz_profile-DvU1SuUS.pdf")) {
        fd.append("previousUrl", previousPdfUrl);
      }
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setPdfForm((prev) => ({ ...prev, pdfUrl: data.url }));
        // Also send explicit DELETE call to guarantee old PDF removal
        if (previousPdfUrl && previousPdfUrl !== data.url && !previousPdfUrl.includes("okobiz_profile-DvU1SuUS.pdf")) {
          fetch(`/api/upload?url=${encodeURIComponent(previousPdfUrl)}`, { method: "DELETE" }).catch(() => {});
        }
      } else {
        alert(data.message || "Failed to upload PDF");
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      alert("An error occurred while uploading the PDF.");
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
        setTimeout(() => setPdfSavedSuccess(false), 3500);
      } else {
        alert(data.message || "Failed to update Portfolio PDF settings.");
      }
    } catch (err) {
      console.error("Error saving portfolio PDF settings:", err);
      alert("An error occurred while saving.");
    } finally {
      setSavingPdf(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const res = await fetch("/api/themes");
      const data = await res.json();
      if (data.success) setThemes(data.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
    fetchPdfSettings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Open Create Modal with NO default data
  const openCreate = () => {
    setEditItem(null);
    setForm({
      websiteTitle: "",
      slug: "",
      category: "Web Applications",
      clientName: "",
      mediaType: "image",
      price: 0,
      discountPrice: 0,
      websiteLink: "",
      photo: "",
      video: "",
      videoThumbnail: "",
      youtubeUrl: "",
      popularBadge: false,
      featuredBadge: false,
      description: "",
      challenge: "",
      solution: "",
      featuresText: "",
    });
    setModalOpen(true);
  };

  // Open Edit Modal with existing data
  const openEdit = (item: any) => {
    setEditItem(item);
    const isYt = isYouTubeUrl(item.video);
    setForm({
      websiteTitle: item.websiteTitle || "",
      slug: item.slug || createSlug(item.websiteTitle || ""),
      category: item.category || "Web Applications",
      clientName: item.clientName || "",
      mediaType: item.mediaType || (item.video ? "video" : "image"),
      price: item.price || 0,
      discountPrice: item.discountPrice || 0,
      websiteLink: item.websiteLink || "",
      photo: item.photo || "",
      video: isYt ? "" : (item.video || ""),
      videoThumbnail: item.videoThumbnail || "",
      youtubeUrl: isYt ? item.video : (item.youtubeUrl || ""),
      popularBadge: Boolean(item.popularBadge),
      featuredBadge: Boolean(item.featuredBadge),
      description: item.description || "",
      challenge: item.challenge || "",
      solution: item.solution || "",
      featuresText: Array.isArray(item.features) ? item.features.join("\n") : "",
    });
    setModalOpen(true);
  };

  // File upload handler
  const handleFileUpload = async (
    file: File,
    type: "photo" | "video" | "videoThumbnail"
  ) => {
    if (type === "video") {
      if (file.size > 200 * 1024 * 1024) {
        alert("Video exceeds the maximum upload limit of 200MB.");
        return;
      }
    } else {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image exceeds the maximum upload limit of 5MB.");
        return;
      }
    }

    const fd = new FormData();
    fd.append("file", file);

    if (type === "photo") setUploadingImage(true);
    if (type === "video") setUploadingVideo(true);
    if (type === "videoThumbnail") setUploadingVideoThumb(true);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((f) => ({ ...f, [type]: data.url }));
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload.");
    } finally {
      if (type === "photo") setUploadingImage(false);
      if (type === "video") setUploadingVideo(false);
      if (type === "videoThumbnail") setUploadingVideoThumb(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      const updates: any = { websiteTitle: val };
      if (!editItem || !prev.slug || prev.slug === createSlug(prev.websiteTitle)) {
        updates.slug = createSlug(val);
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine the active video url
    let activeVideo = "";
    if (form.mediaType === "video") {
      if (form.youtubeUrl && isYouTubeUrl(form.youtubeUrl)) {
        activeVideo = form.youtubeUrl.trim();
      } else if (form.video) {
        activeVideo = form.video;
      }
    }

    // Determine fallback thumbnail
    let activeThumb = form.videoThumbnail;
    if (form.mediaType === "video" && !activeThumb && isYouTubeUrl(activeVideo)) {
      activeThumb = getYouTubeThumbnailUrl(activeVideo) || "";
    }

    const finalSlug = createSlug(form.slug || form.websiteTitle || "project");

    const payload = {
      ...form,
      slug: finalSlug,
      video: activeVideo,
      videoThumbnail: activeThumb,
      photo: form.mediaType === "video" ? (activeThumb || form.photo || "") : form.photo,
      features: form.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
    };

    if (editItem) {
      await fetch("/api/themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editItem._id, ...payload }),
      });
    } else {
      await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setModalOpen(false);
    fetchThemes();
  };

  // Delete project and automatically purge its images and videos from Cloud storage
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Briefcase className="text-[#3368B2]" size={24} />
            Portfolio Projects & Case Studies
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Manage completed projects, client showcase works, video showcases, and credentials PDF
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition"
        >
          <Plus size={16} /> Add New Project
        </button>
      </div>

      {/* Portfolio PDF Download Section Management (without Live Preview, 4px radius) */}
      <div className="bg-[#131417] border border-gray-800 rounded-[4px] p-6 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#3368B2]/20 border border-[#3368B2]/40 flex items-center justify-center text-[#3368B2]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Portfolio PDF Section
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Edit the heading, subheading, and company credentials PDF file shown at the top of the client portfolio page.
              </p>
            </div>
          </div>

          {pdfSavedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold animate-pulse">
              <CheckCircle2 size={14} />
              <span>Saved and published live!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSavePdf} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Heading Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={pdfForm.heading}
                onChange={(e) => setPdfForm({ ...pdfForm, heading: e.target.value })}
                placeholder="e.g. okobiz Official Profile & Credentials 2024"
                className="w-full bg-[#181A1E] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                required
              />
            </div>

            {/* Badge Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Badge Tag Text
              </label>
              <input
                type="text"
                value={pdfForm.badge}
                onChange={(e) => setPdfForm({ ...pdfForm, badge: e.target.value })}
                placeholder="e.g. VERIFIED"
                className="w-full bg-[#181A1E] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
              />
            </div>
          </div>

          {/* Subheading Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Section Subheading
            </label>
            <input
              type="text"
              value={pdfForm.subheading}
              onChange={(e) => setPdfForm({ ...pdfForm, subheading: e.target.value })}
              placeholder="e.g. Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)"
              className="w-full bg-[#181A1E] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
              required
            />
          </div>

          {/* PDF File Upload (Only Upload Button) */}
          <div className="bg-[#181A1E] border border-gray-800 rounded-[4px] p-4">
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Official PDF File
            </label>

            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePdfUpload(file);
                }}
              />

              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploadingPdf}
                className="px-5 py-2.5 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {uploadingPdf ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Uploading PDF...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} />
                    <span>Upload PDF</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom: Recently uploaded file name */}
            <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center gap-2 text-xs">
              <span className="text-gray-400">Recently uploaded:</span>
              {pdfForm.pdfUrl ? (
                <span className="text-white font-medium font-mono text-[11px] bg-white/5 border border-gray-800 px-2.5 py-1 rounded-[4px] truncate max-w-md">
                  {pdfForm.pdfUrl.split("?")[0].split("/").pop() || pdfForm.pdfUrl}
                </span>
              ) : (
                <span className="text-gray-500 italic">No PDF uploaded</span>
              )}
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="submit"
              disabled={savingPdf || uploadingPdf}
              className="px-6 py-2.5 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition disabled:opacity-50"
            >
              {savingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save PDF Section Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter / Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project, client, or category..."
          className="w-full bg-[#131417] border border-gray-800 rounded-[4px] pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
        />
      </div>

      {/* Projects Grid (4px radius) */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">Loading portfolio projects...</div>
      ) : (
        <>
          {paginatedItems.length === 0 ? (
            <div className="text-center py-16 bg-[#131417] border border-gray-800 rounded-[4px] text-gray-500 text-xs">
              No portfolio projects found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedItems.map((item) => {
                const hasVideo = item.mediaType === "video" || !!item.video;
                const isYt = isYouTubeUrl(item.video);
                const displayImage =
                  item.videoThumbnail ||
                  (isYt ? getYouTubeThumbnailUrl(item.video) : null) ||
                  item.photo ||
                  "/assets/bdhajj-D468QQtK.png";

                return (
                  <div
                    key={item._id}
                    className="bg-[#131417] border border-gray-800 rounded-[4px] overflow-hidden shadow-xl flex flex-col group hover:border-[#3368B2] transition duration-200"
                  >
                    {/* Media Preview Box */}
                    <div className="relative h-48 bg-black overflow-hidden rounded-t-[4px]">
                      <img
                        src={displayImage}
                        alt={item.websiteTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-[4px] bg-[#3368B2] text-white text-[11px] font-bold">
                          {item.category}
                        </span>
                        {hasVideo && (
                          <span className="px-2.5 py-1 rounded-[4px] bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1">
                            <Play size={10} fill="white" /> Video
                          </span>
                        )}
                        {item.popularBadge && (
                          <span className="px-2 py-0.5 rounded-[4px] bg-amber-500 text-black text-[10px] font-black flex items-center gap-1">
                            <Star size={10} fill="black" /> Popular
                          </span>
                        )}
                      </div>

                      {item.clientName && (
                        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm px-2.5 py-0.5 rounded-[4px] text-[11px] text-gray-300">
                          Client: <span className="text-white font-medium">{item.clientName}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#3368B2] transition line-clamp-1">
                          {item.websiteTitle}
                        </h3>
                        <div className="mt-1">
                          <span className="font-mono text-[10px] text-gray-400 bg-[#0d0e11] px-2 py-0.5 rounded border border-gray-800 inline-block truncate max-w-full">
                            /portfolio/{item.slug || createSlug(item.websiteTitle)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                          {cleanSnippet(item.description) || "Completed project showcase delivered with high performance and modern UX."}
                        </p>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-800/80">
                        {item.websiteLink ? (
                          <a
                            href={item.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#3368B2] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Live Preview</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-500">Case Study</span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
                            title="Edit Project"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-[4px] bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                            title="Delete Project (Purges cloud assets)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 12 items pagination bar */}
          {filtered.length > 0 && (
            <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                Showing <span className="text-white font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="text-white font-semibold">{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)}</span> of{" "}
                <span className="text-white font-semibold">{filtered.length}</span> projects
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-[#131417] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                          ? "bg-[#3368B2] text-white border border-[#3368B2]"
                          : "bg-[#131417] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-[#131417] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
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

      {/* Project Modal: Create & Edit (Refined UX, No clumsy link inputs, 4px radius) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#131417] border border-gray-800 rounded-[4px] w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Briefcase className="text-[#3368B2]" size={20} />
              {editItem ? "Edit Portfolio Project" : "Add New Completed Project"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={form.websiteTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Agro Infusion Smart Supply Hub"
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3368B2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    placeholder="e.g. Agro Infusion Ltd."
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3368B2]"
                  />
                </div>
              </div>

              {/* URL Slug Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                  <span>Project URL Slug <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Live URL: <span className="text-blue-400">/portfolio/{form.slug || "project-slug"}</span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. agro-infusion-smart-supply-hub"
                  className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3368B2] font-mono"
                />
              </div>

              {/* Category & Media Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3368B2]"
                  >
                    <option value="Web Applications">Web Applications</option>
                    <option value="Mobile & SaaS">Mobile & SaaS</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Corporate Systems">Corporate Systems</option>
                    <option value="Agency">Agency</option>
                    <option value="Motion & Video">Motion & Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Media Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mediaType: "image" })}
                      className={`flex-1 py-2 text-xs font-semibold rounded-[4px] border transition flex items-center justify-center gap-1.5 ${
                        form.mediaType === "image"
                          ? "bg-[#3368B2] text-white border-[#3368B2]"
                          : "bg-[#181A1F] text-gray-400 border-gray-800 hover:text-white"
                      }`}
                    >
                      <ImageIcon size={14} /> Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mediaType: "video" })}
                      className={`flex-1 py-2 text-xs font-semibold rounded-[4px] border transition flex items-center justify-center gap-1.5 ${
                        form.mediaType === "video"
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-[#181A1F] text-gray-400 border-gray-800 hover:text-white"
                      }`}
                    >
                      <Video size={14} /> Video
                    </button>
                  </div>
                </div>
              </div>

              {/* 1. IMAGE MEDIA TYPE: Only image upload, no video options */}
              {form.mediaType === "image" && (
                <div className="p-4 rounded-[4px] bg-[#181A1F] border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-white">
                        Project Image *
                      </label>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Upload the primary showcase cover image for this portfolio piece.
                      </p>
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "photo");
                      }}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-4 py-2 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={14} />
                          <span>{form.photo ? "Change Image" : "Upload Image"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Image Preview with Remove Option */}
                  {form.photo ? (
                    <div className="relative rounded-[4px] overflow-hidden bg-black/60 border border-gray-800 group h-40 flex items-center justify-center">
                      <img src={form.photo} alt="Thumbnail preview" className="w-full h-full object-contain" />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-[4px] bg-black/75 hover:bg-black text-white text-[11px] font-medium backdrop-blur-sm border border-gray-700 transition"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, photo: "" })}
                          className="px-2.5 py-1 rounded-[4px] bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-medium transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-800 hover:border-gray-700 rounded-[4px] p-6 text-center cursor-pointer transition bg-[#141518]"
                    >
                      <ImageIcon className="mx-auto text-gray-500 mb-2" size={24} />
                      <p className="text-xs text-gray-400 font-medium">Click to upload portfolio image</p>
                      <p className="text-[10px] text-gray-600 mt-1">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. VIDEO MEDIA TYPE: Thumbnail, Upload Video button, and YouTube Link */}
              {form.mediaType === "video" && (
                <div className="p-4 rounded-[4px] bg-black/40 border border-gray-800 space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider pb-2 border-b border-gray-800/80">
                    <Video size={15} /> Video Project Configuration
                  </div>

                  {/* Video Poster Thumbnail Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-semibold text-gray-200">
                          Video Poster Thumbnail
                        </label>
                        <p className="text-[11px] text-gray-400">
                          Display poster prior to playback (optional for YouTube videos).
                        </p>
                      </div>

                      <input
                        type="file"
                        ref={videoThumbInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "videoThumbnail");
                        }}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => videoThumbInputRef.current?.click()}
                        disabled={uploadingVideoThumb}
                        className="px-4 py-2 rounded-[4px] bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                      >
                        {uploadingVideoThumb ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={14} />
                            <span>{form.videoThumbnail ? "Change Thumbnail" : "Upload Thumbnail"}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {form.videoThumbnail ? (
                      <div className="relative rounded-[4px] overflow-hidden bg-black/60 border border-gray-800 h-28 flex items-center justify-center">
                        <img src={form.videoThumbnail} alt="Poster" className="w-full h-full object-contain" />
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => videoThumbInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-[4px] bg-black/75 hover:bg-black text-white text-[11px] font-medium backdrop-blur-sm border border-gray-700 transition"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, videoThumbnail: "" })}
                            className="px-2.5 py-1 rounded-[4px] bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-medium transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : form.youtubeUrl && isYouTubeUrl(form.youtubeUrl) ? (
                      <div className="rounded-[4px] bg-[#141518] border border-gray-800 p-2.5 flex items-center gap-3">
                        <img
                          src={getYouTubeThumbnailUrl(form.youtubeUrl) || ""}
                          alt="YouTube Cover Preview"
                          className="w-16 h-12 object-cover rounded-[2px] border border-gray-700 shrink-0"
                        />
                        <div className="text-[11px] text-gray-400">
                          <span className="text-white font-medium">Automatic YouTube Thumbnail:</span> Using default HD cover from YouTube. You can also upload a custom thumbnail above.
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* YouTube Video Paste Link */}
                  <div className="space-y-2 pt-3 border-t border-gray-800/80">
                    <label className="block text-xs font-semibold text-gray-200">
                      YouTube Video Link
                    </label>
                    <input
                      type="url"
                      value={form.youtubeUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, youtubeUrl: val });
                      }}
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                      className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-600"
                    />

                    {/* YouTube Live Embed Preview */}
                    {form.youtubeUrl && isYouTubeUrl(form.youtubeUrl) && (
                      <div className="rounded-[4px] overflow-hidden border border-gray-800 bg-black mt-2">
                        <div className="aspect-video w-full">
                          <iframe
                            src={getYouTubeEmbedUrl(form.youtubeUrl) || ""}
                            title="YouTube Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                        <div className="p-2 bg-[#121316] text-[11px] text-green-400 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 size={13} /> Valid YouTube video parsed & verified ready for playback.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Video File Button */}
                  <div className="space-y-2 pt-3 border-t border-gray-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-semibold text-gray-200">
                          Or Upload Video File (MP4 / WebM / MOV)
                        </label>
                        <p className="text-[11px] text-gray-400">Max size 200MB with cloud streaming.</p>
                      </div>

                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "video");
                        }}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingVideo}
                        className="px-4 py-2 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                      >
                        {uploadingVideo ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Uploading Video...</span>
                          </>
                        ) : (
                          <>
                            <Video size={14} />
                            <span>{form.video ? "Change Video File" : "Upload Video File"}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {form.video && (
                      <div className="relative rounded-[4px] overflow-hidden bg-black border border-gray-800 p-2">
                        <video src={form.video} controls className="w-full max-h-48 object-contain rounded-[4px]" />
                        <div className="flex justify-end mt-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, video: "" })}
                            className="px-2.5 py-1 rounded-[4px] bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-medium transition"
                          >
                            Remove Video File
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Live Link */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Live Project / Website Link</label>
                <input
                  type="url"
                  value={form.websiteLink}
                  onChange={(e) => setForm({ ...form, websiteLink: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3368B2]"
                />
              </div>

              {/* Description / Overview with Reusable Rich Text Editor */}
              <RichTextEditor
                value={form.description}
                onChange={(val) => setForm({ ...form, description: val })}
                label="Description / Overview *"
                placeholder="Comprehensive overview of the project goals, architecture, tech stack, and delivered client impact..."
                minHeight="min-h-[180px]"
              />

              {/* Challenge & Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">The Challenge</label>
                  <textarea
                    rows={3}
                    value={form.challenge}
                    onChange={(e) => setForm({ ...form, challenge: e.target.value })}
                    placeholder="Technical obstacles faced during development..."
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3368B2] leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">The Solution</label>
                  <textarea
                    rows={3}
                    value={form.solution}
                    onChange={(e) => setForm({ ...form, solution: e.target.value })}
                    placeholder="Engineering approach and custom solutions deployed..."
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3368B2] leading-relaxed"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Deliverables & Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="e.g.&#10;Custom responsive UI/UX architecture&#10;Instant Payment Gateway IPN Integration&#10;Sub-second Edge SSR Caching"
                  className="w-full bg-[#181A1F] border border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#3368B2]"
                />
              </div>

              {/* Badges */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.popularBadge}
                    onChange={(e) => setForm({ ...form, popularBadge: e.target.checked })}
                    className="w-4 h-4 rounded-[4px] text-[#3368B2] bg-gray-800 border-gray-700"
                  />
                  <span>Popular Badge</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.featuredBadge}
                    onChange={(e) => setForm({ ...form, featuredBadge: e.target.checked })}
                    className="w-4 h-4 rounded-[4px] text-[#3368B2] bg-gray-800 border-gray-700"
                  />
                  <span>Featured Case Study</span>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition"
                >
                  {editItem ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
