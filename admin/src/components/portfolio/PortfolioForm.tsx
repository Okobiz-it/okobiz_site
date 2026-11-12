"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  Save,
  Loader2,
  UploadCloud,
  ImageIcon,
  Video,
  Star,
  ExternalLink,
  Trash2,
  Sparkles,
  Layers,
  HelpCircle,
  X,
  CheckCircle2,
  Globe,
  Tag,
  DollarSign
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import TechnologyIconPicker from "@/components/TechnologyIconPicker";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { createSlug } from "@/lib/slug";
import { toast } from "@/lib/toast";
import { Textarea } from "@/components/ui/textarea";

export interface PortfolioFormData {
  _id?: string;
  websiteTitle: string;
  slug: string;
  category: string;
  clientName: string;
  mediaType: "image" | "video";
  price: number;
  discountPrice: number;
  websiteLink: string;
  photo: string;
  video: string;
  videoThumbnail: string;
  youtubeUrl: string;
  popularBadge: boolean;
  featuredBadge: boolean;
  description: string;
  challenge: string;
  solution: string;
  featuresText: string;
  techStack: string[];
}

const DEFAULT_FORM: PortfolioFormData = {
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
  techStack: ["Next.js", "TypeScript", "Tailwind CSS", "MongoDB"],
};

const CATEGORIES = [
  "Web Applications",
  "Enterprise ERP & SaaS",
  "E-Commerce Solutions",
  "Mobile Applications",
  "UI/UX Design Systems",
  "FinTech & POS Solutions",
  "Healthcare & Clinic ERP",
  "Custom Software"
];

interface PortfolioFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function PortfolioForm({ initialData, isEdit = false }: PortfolioFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PortfolioFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // File Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingVideoThumb, setUploadingVideoThumb] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const videoThumbInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialData) {
      const isYt = isYouTubeUrl(initialData.video);
      setForm({
        _id: initialData._id,
        websiteTitle: initialData.websiteTitle || "",
        slug: initialData.slug || createSlug(initialData.websiteTitle || ""),
        category: initialData.category || "Web Applications",
        clientName: initialData.clientName || "",
        mediaType: initialData.mediaType || (initialData.video ? "video" : "image"),
        price: Number(initialData.price) || 0,
        discountPrice: Number(initialData.discountPrice) || 0,
        websiteLink: initialData.websiteLink || "",
        photo: initialData.photo || "",
        video: isYt ? "" : initialData.video || "",
        videoThumbnail: initialData.videoThumbnail || "",
        youtubeUrl: isYt ? initialData.video : "",
        popularBadge: Boolean(initialData.popularBadge),
        featuredBadge: Boolean(initialData.featuredBadge),
        description: initialData.description || "",
        challenge: initialData.challenge || "",
        solution: initialData.solution || "",
        featuresText: Array.isArray(initialData.features)
          ? initialData.features.join("\n")
          : (initialData.features || ""),
        techStack: Array.isArray(initialData.techStack) && initialData.techStack.length > 0
          ? initialData.techStack
          : DEFAULT_FORM.techStack,
      });
    }
  }, [initialData]);

  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      const updates: Partial<PortfolioFormData> = { websiteTitle: val };
      if (!isEdit || !prev.slug || prev.slug === createSlug(prev.websiteTitle)) {
        updates.slug = createSlug(val);
      }
      return { ...prev, ...updates };
    });
  };

  const handleUpload = async (file: File, type: "photo" | "video" | "videoThumbnail") => {
    if (!file) return;

    if (type === "video") {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video file size cannot exceed 50MB");
        return;
      }
      setUploadingVideo(true);
    } else if (type === "videoThumbnail") {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Thumbnail size cannot exceed 5MB");
        return;
      }
      setUploadingVideoThumb(true);
    } else {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size cannot exceed 5MB");
        return;
      }
      setUploadingImage(true);
    }

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, [type]: data.url }));
        toast.success(`${type === "photo" ? "Image" : type === "video" ? "Video" : "Thumbnail"} uploaded!`);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Network upload error");
    } finally {
      if (type === "video") setUploadingVideo(false);
      else if (type === "videoThumbnail") setUploadingVideoThumb(false);
      else setUploadingImage(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.websiteTitle.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    let activeVideo = "";
    if (form.mediaType === "video") {
      if (form.youtubeUrl && isYouTubeUrl(form.youtubeUrl)) {
        activeVideo = form.youtubeUrl.trim();
      } else if (form.video) {
        activeVideo = form.video;
      }
    }

    let activeThumb = form.videoThumbnail;
    if (form.mediaType === "video" && !activeThumb && isYouTubeUrl(activeVideo)) {
      activeThumb = getYouTubeThumbnailUrl(activeVideo) || "";
    }

    const finalSlug = createSlug(form.slug || form.websiteTitle || "project");

    const payload = {
      ...form,
      websiteTitle: form.websiteTitle.trim(),
      slug: finalSlug,
      video: activeVideo,
      videoThumbnail: activeThumb,
      photo: form.mediaType === "video" ? (activeThumb || form.photo || "") : form.photo,
      features: form.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
    };

    setSaving(true);
    const toastId = toast.loading(isEdit ? "Updating portfolio project..." : "Creating portfolio project...");

    try {
      let res: Response;
      if (isEdit && form._id) {
        res = await fetch("/api/themes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: form._id, ...payload }),
        });
      } else {
        res = await fetch("/api/themes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      toast.dismiss(toastId);

      if (!res.ok || !resData.success) {
        toast.error(resData.message || "Failed to save project");
        return;
      }

      toast.success(isEdit ? "Project updated successfully!" : "Project created successfully!");
      router.push("/dashboard/portfolio");
      router.refresh();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#131417] p-4 rounded-[6px] border border-slate-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/portfolio"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>
          <div className="h-5 w-px bg-slate-200 dark:bg-gray-800 hidden sm:block" />
          <div className="min-w-0">
            <h1
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate max-w-[280px] sm:max-w-md lg:max-w-xl"
              title={isEdit ? `Edit Project: ${form.websiteTitle || "Untitled"}` : "Add Portfolio Project"}
            >
              <Briefcase className="w-5 h-5 text-[#0167D6] shrink-0" />
              <span className="truncate">{isEdit ? `Edit Project: ${form.websiteTitle || "Untitled"}` : "Add Portfolio Project"}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Link
            href="/dashboard/portfolio"
            className="px-4 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </Link>

          {form.websiteLink && (
            <a
              href={form.websiteLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[4px] border border-blue-200 dark:border-blue-800 text-[#0167D6] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            >
              <ExternalLink size={13} /> Test Live Link
            </a>
          )}

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{isEdit ? "Update Project" : "Publish Project"}</span>
          </button>
        </div>
      </div>

      {/* Unified Master Form Container */}
      <div className="bg-white dark:bg-[#131417] rounded-[6px] border border-slate-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-gray-800">
          
          {/* Left Column: Primary Project Workspace (8 Cols) */}
          <div className="lg:col-span-8 p-6 space-y-6">
            
            {/* Project Overview & Meta */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0167D6] dark:text-blue-400 flex items-center gap-2">
                  <Tag size={14} />
                  Project Overview &amp; Meta
                </h2>
                <span className="text-[11px] text-slate-400 dark:text-gray-500 font-mono">
                  /portfolio/{form.slug || "slug"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Project / Website Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MedFlow Health - Clinical Management Platform"
                    value={form.websiteTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                      URL Slug (/portfolio/slug)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="medflow-health"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, slug: createSlug(form.websiteTitle) })}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-[4px] text-xs font-medium cursor-pointer transition"
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6] cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Client / Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MedFlow Inc, USA"
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Live Preview / Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://client-demo.okobiz.com"
                      value={form.websiteLink}
                      onChange={(e) => setForm({ ...form, websiteLink: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Description & Case Study */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-200 dark:border-gray-800 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0167D6] dark:text-blue-400 flex items-center gap-2">
                  <Layers size={14} />
                  Detailed Description &amp; Case Study
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Overview &amp; Deliverables Description *
                </label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Describe client goals, architectural decisions, and project outcomes..."
                  minHeight="min-h-[380px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Key Challenges
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="What core architectural, scaling, or operational hurdles did the client face?"
                    value={form.challenge}
                    onChange={(e) => setForm({ ...form, challenge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Our Engineering Solution
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="How did Okobiz engineer and deliver the high-performance solution?"
                    value={form.solution}
                    onChange={(e) => setForm({ ...form, solution: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Core Features (One per line)
                </label>
                <Textarea
                  rows={3}
                  placeholder="Real-time multi-tenant sync&#10;Role-based access control&#10;Automated PDF invoice generation"
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Technologies &amp; Libraries Used
                </label>
                <TechnologyIconPicker
                  selected={form.techStack || []}
                  onChange={(icons) => setForm({ ...form, techStack: icons })}
                />
              </div>
            </div>

          </div>

          {/* Right Column: Media, Badges & Commercial (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-50/50 dark:bg-[#15171B]/50 p-6 space-y-6">
            
            {/* Media Assets Showcase */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-gray-800 pb-2.5">
                <ImageIcon size={14} className="text-[#0167D6]" />
                Media Assets &amp; Video
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Primary Media Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mediaType: "image" })}
                    className={`py-2 px-3 rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                      form.mediaType === "image"
                        ? "border-[#0167D6] bg-blue-50 text-[#0167D6] dark:bg-blue-950/40 dark:text-blue-400"
                        : "border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <ImageIcon size={14} /> Still Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mediaType: "video" })}
                    className={`py-2 px-3 rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                      form.mediaType === "video"
                        ? "border-[#0167D6] bg-blue-50 text-[#0167D6] dark:bg-blue-950/40 dark:text-blue-400"
                        : "border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Video size={14} /> Video / Demo
                  </button>
                </div>
              </div>

              {/* Still Image Upload (NO URL INPUT FIELD) */}
              {form.mediaType === "image" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">
                    Project Featured Screenshot
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-300 dark:border-gray-700 rounded-[6px] p-4 text-center bg-white dark:bg-[#18191D]">
                    {form.photo ? (
                      <div className="relative group rounded-[4px] overflow-hidden bg-black flex items-center justify-center aspect-video mb-3">
                        <img src={form.photo} alt="Screenshot Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, photo: "" })}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-[4px] opacity-90 hover:opacity-100 transition shadow cursor-pointer"
                          title="Remove Screenshot"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="py-6">
                        <ImageIcon className="mx-auto text-slate-400 dark:text-gray-600 mb-2" size={36} />
                        <p className="text-xs font-medium text-slate-600 dark:text-gray-300">No screenshot uploaded</p>
                        <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">PNG, JPG, or WEBP up to 5MB</p>
                      </div>
                    )}

                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, "photo");
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      <span>{uploadingImage ? "Uploading Screenshot..." : form.photo ? "Replace Screenshot" : "Upload Screenshot"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Video Settings */}
              {form.mediaType === "video" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                      YouTube Video URL (Preferred)
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={form.youtubeUrl}
                      onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                    />
                    {form.youtubeUrl && isYouTubeUrl(form.youtubeUrl) && (
                      <div className="mt-2 aspect-video rounded-[4px] overflow-hidden border border-slate-200 dark:border-gray-800 bg-black">
                        <iframe
                          src={getYouTubeEmbedUrl(form.youtubeUrl) || undefined}
                          className="w-full h-full"
                          title="YouTube Preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Or Upload Direct MP4 Video
                    </label>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, "video");
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingVideo}
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 hover:border-slate-400 text-slate-700 dark:text-gray-200 text-xs font-semibold rounded-[4px] transition cursor-pointer"
                    >
                      {uploadingVideo ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                      <span>{uploadingVideo ? "Uploading Video..." : form.video ? "Change Uploaded Video" : "Upload MP4 Video"}</span>
                    </button>
                    {form.video && (
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                        File: {form.video.split("/").pop()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Video Thumbnail Image
                    </label>
                    <input
                      ref={videoThumbInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, "videoThumbnail");
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingVideoThumb}
                      onClick={() => videoThumbInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 hover:border-slate-400 text-slate-700 dark:text-gray-200 text-xs font-semibold rounded-[4px] transition cursor-pointer"
                    >
                      {uploadingVideoThumb ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                      <span>{uploadingVideoThumb ? "Uploading Thumbnail..." : form.videoThumbnail ? "Change Video Thumbnail" : "Upload Video Thumbnail"}</span>
                    </button>
                    {form.videoThumbnail && (
                      <div className="mt-2 aspect-video rounded-[4px] overflow-hidden border border-slate-200 dark:border-gray-800 bg-black">
                        <img src={form.videoThumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Badges & Visibility */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-gray-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                Badges &amp; Showcase Status
              </h2>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-gray-200 cursor-pointer p-2.5 rounded-[4px] bg-white dark:bg-[#18191D] border border-slate-200 dark:border-gray-800">
                <input
                  type="checkbox"
                  checked={form.featuredBadge}
                  onChange={(e) => setForm({ ...form, featuredBadge: e.target.checked })}
                  className="rounded text-[#0167D6] w-4 h-4"
                />
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span>Featured Project (Highlighted in Homepage)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-gray-200 cursor-pointer p-2.5 rounded-[4px] bg-white dark:bg-[#18191D] border border-slate-200 dark:border-gray-800">
                <input
                  type="checkbox"
                  checked={form.popularBadge}
                  onChange={(e) => setForm({ ...form, popularBadge: e.target.checked })}
                  className="rounded text-[#0167D6] w-4 h-4"
                />
                <Sparkles size={14} className="text-blue-500" />
                <span>Popular / Trending Badge</span>
              </label>
            </div>

            {/* Commercial & Pricing */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-gray-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-500" />
                Commercial &amp; Pricing Info
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Budget / Price (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Regular Price (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={form.discountPrice || ""}
                    onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
