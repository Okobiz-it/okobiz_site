"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Server,
  ArrowLeft,
  Save,
  Loader2,
  UploadCloud,
  ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  HelpCircle,
  Tag,
  ExternalLink,
  Video,
  Play,
  CheckCircle2,
  Star,
  Film,
  Images,
  AlertCircle,
  Eye,
  Check,
  X,
  Edit2
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import TechnologyIconPicker from "@/components/TechnologyIconPicker";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { createSlug } from "@/lib/slug";
import { toast } from "@/lib/toast";
import { Textarea } from "@/components/ui/textarea";

export interface WhyChooseItem {
  title: string;
  desc: string;
}

export interface PricingPlanForm {
  name: string;
  price: number;
  discountPrice?: number;
  period?: string;
  badge?: string;
  description?: string;
  featuresText: string;
  isPopular?: boolean;
}

export interface ServiceFormData {
  _id?: string;
  title: string;
  slug: string;
  image: string; // Primary front cover thumbnail
  thumbnail: string;
  mediaType: "image" | "video";
  images: string[];
  video: string;
  videoThumbnail: string;
  youtubeUrl: string;
  bannerImage: string;
  bannerSubtitle: string;
  shortDesc: string;
  fullDesc: string;
  featuresText: string;
  whyChooseUs: WhyChooseItem[];
  techStackText: string;
  techStack: string[];
  pricingPlans: PricingPlanForm[];
  order: number;
}

const DEFAULT_FORM: ServiceFormData = {
  title: "",
  slug: "",
  image: "",
  thumbnail: "",
  mediaType: "image",
  images: [],
  video: "",
  videoThumbnail: "",
  youtubeUrl: "",
  bannerImage: "",
  bannerSubtitle: "",
  shortDesc: "",
  fullDesc: "",
  featuresText: "",
  whyChooseUs: [
    { title: "Expert Engineering Team", desc: "Highly skilled developers with deep domain specialization and proven delivery records." },
    { title: "Tailored Architecture", desc: "Custom designed to align with your exact business operations and conversion goals." }
  ],
  techStackText: "React, Next.js, TypeScript, Node.js, Tailwind CSS",
  techStack: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS"],
  pricingPlans: [
    {
      name: "Starter Package",
      price: 15000,
      discountPrice: 12000,
      period: "One-Time Setup",
      badge: "Standard",
      description: "Ideal for startups and growing businesses looking to establish a reliable foundation.",
      featuresText: "Core Setup & Integration\nResponsive Modern Layout\nOn-Page SEO Optimization\n1 Month Complimentary Maintenance",
      isPopular: false
    }
  ],
  order: 1
};

interface ServiceFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function ServiceForm({ initialData, isEdit = false }: ServiceFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [existingServices, setExistingServices] = useState<any[]>([]);

  // Media upload states
  const [uploadingMultiImages, setUploadingMultiImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // File input refs
  const multiImagesInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const directImageUrlRef = useRef<HTMLInputElement>(null);

  // Fetch list of services to check slug collisions
  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setExistingServices(d.data);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize form with initialData if in edit mode
  useEffect(() => {
    if (initialData) {
      const isYt = isYouTubeUrl(initialData.video);
      const initialImages: string[] = Array.isArray(initialData.images) && initialData.images.length > 0
        ? initialData.images
        : initialData.image
        ? [initialData.image]
        : [];

      const initialThumb = initialData.thumbnail || initialData.image || (initialImages[0] ?? "");

      setForm({
        _id: initialData._id,
        title: initialData.title || "",
        slug: initialData.slug || createSlug(initialData.title || ""),
        image: initialThumb,
        thumbnail: initialThumb,
        mediaType: initialData.mediaType || (initialData.video ? "video" : "image"),
        images: initialImages,
        video: isYt ? "" : initialData.video || "",
        videoThumbnail: initialData.videoThumbnail || "",
        youtubeUrl: isYt ? initialData.video : "",
        bannerImage: initialData.bannerImage || "",
        bannerSubtitle: initialData.bannerSubtitle || "",
        shortDesc: initialData.shortDesc || "",
        fullDesc: initialData.fullDesc || "",
        featuresText: Array.isArray(initialData.features) ? initialData.features.join("\n") : "",
        whyChooseUs: Array.isArray(initialData.whyChooseUs) && initialData.whyChooseUs.length > 0
          ? initialData.whyChooseUs
          : DEFAULT_FORM.whyChooseUs,
        techStackText: Array.isArray(initialData.techStack) ? initialData.techStack.join(", ") : "",
        techStack: Array.isArray(initialData.techStack) ? initialData.techStack : [],
        pricingPlans: Array.isArray(initialData.pricingPlans)
          ? initialData.pricingPlans.map((p: any) => ({
              name: p.name || "",
              price: p.price || 0,
              discountPrice: p.discountPrice || 0,
              period: p.period || "",
              badge: p.badge || "",
              description: p.description || "",
              featuresText: Array.isArray(p.features) ? p.features.join("\n") : "",
              isPopular: Boolean(p.isPopular)
            }))
          : [],
        order: initialData.order || 1
      });
    }
  }, [initialData]);

  const normalizedFormSlug = createSlug(form.slug);
  const isDuplicateSlug = Boolean(
    normalizedFormSlug &&
    existingServices.some(
      (s) => s.slug?.toLowerCase().trim() === normalizedFormSlug && s._id !== initialData?._id
    )
  );

  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      const updates: Partial<ServiceFormData> = { title: val };
      if (!isEdit || !prev.slug || prev.slug === createSlug(prev.title)) {
        updates.slug = createSlug(val);
      }
      return { ...prev, ...updates };
    });
  };

  // ─────────────────────────────────────────────────────────────
  // MEDIA UPLOADS & HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleMultipleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingMultiImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) continue;
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm((prev) => {
          const nextImages = [...prev.images, ...uploadedUrls];
          const newThumb = prev.thumbnail || nextImages[0];
          return {
            ...prev,
            images: nextImages,
            thumbnail: newThumb,
            image: newThumb,
          };
        });
        toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
      }
    } catch (err: any) {
      toast.error("Error uploading images: " + err.message);
    } finally {
      setUploadingMultiImages(false);
      if (multiImagesInputRef.current) multiImagesInputRef.current.value = "";
    }
  };

  const handleAddDirectImageUrl = () => {
    const input = directImageUrlRef.current;
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;

    setForm((prev) => {
      const nextImages = [...prev.images, val];
      const newThumb = prev.thumbnail || val;
      return {
        ...prev,
        images: nextImages,
        thumbnail: newThumb,
        image: newThumb,
      };
    });
    input.value = "";
    toast.success("Image URL added to gallery!");
  };

  const handleRemoveImage = (idx: number) => {
    setForm((prev) => {
      const removedUrl = prev.images[idx];
      const nextImages = prev.images.filter((_, i) => i !== idx);
      const isCurrentThumb = prev.thumbnail === removedUrl || prev.image === removedUrl;
      const newThumb = isCurrentThumb ? (nextImages[0] || "") : prev.thumbnail;
      return {
        ...prev,
        images: nextImages,
        thumbnail: newThumb,
        image: newThumb,
      };
    });
  };

  const handleSetFrontThumbnail = (url: string) => {
    setForm((prev) => ({
      ...prev,
      thumbnail: url,
      image: url,
      mediaType: "image",
    }));
    toast.success("Front thumbnail updated!");
  };

  const handleSetVideoAsFront = () => {
    setForm((prev) => ({
      ...prev,
      mediaType: "video",
    }));
    toast.success("Video set as primary front showcase!");
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size must be less than 50MB.");
      return;
    }
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({
          ...prev,
          video: data.url,
          youtubeUrl: "",
          mediaType: "video",
        }));
        toast.success("Video showcase uploaded successfully!");
      } else {
        toast.error("Failed to upload video.");
      }
    } catch (err: any) {
      toast.error("Error uploading video: " + err.message);
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!file) return;
    setUploadingBanner(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, bannerImage: data.url }));
        toast.success("Hero banner background uploaded!");
      }
    } catch (err: any) {
      toast.error("Banner upload error: " + err.message);
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PRICING PLANS & WHY CHOOSE US
  // ─────────────────────────────────────────────────────────────
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
  const [planDraft, setPlanDraft] = useState<PricingPlanForm>({
    name: "",
    price: 0,
    period: "One-Time Setup",
    discountPrice: 0,
    description: "",
    featuresText: "",
    isPopular: false,
  });

  const handleOpenAddPlan = () => {
    setPlanDraft({
      name: `Package #${form.pricingPlans.length + 1}`,
      price: 20000,
      period: "One-Time Setup",
      discountPrice: 0,
      description: "Full suite service offering.",
      featuresText: "Priority Cloud Deployment\nDedicated Account Manager\n3 Months Maintenance",
      isPopular: false,
    });
    setEditingPlanIndex(null);
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (idx: number) => {
    setPlanDraft({ ...form.pricingPlans[idx] });
    setEditingPlanIndex(idx);
    setIsPlanModalOpen(true);
  };

  const handleSavePlanDraft = () => {
    if (!planDraft.name.trim()) {
      toast.error("Please provide a package name");
      return;
    }
    setForm((prev) => {
      const nextPlans = [...prev.pricingPlans];
      if (editingPlanIndex !== null && editingPlanIndex >= 0) {
        nextPlans[editingPlanIndex] = planDraft;
      } else {
        nextPlans.push(planDraft);
      }
      return { ...prev, pricingPlans: nextPlans };
    });
    setIsPlanModalOpen(false);
  };

  const handleRemovePricingPlan = (index: number) => {
    setForm((prev) => ({
      ...prev,
      pricingPlans: prev.pricingPlans.filter((_, i) => i !== index),
    }));
  };

  const handleAddWhyChoose = () => {
    setForm((prev) => ({
      ...prev,
      whyChooseUs: [...prev.whyChooseUs, { title: "", desc: "" }]
    }));
  };

  const handleRemoveWhyChoose = (index: number) => {
    setForm((prev) => ({
      ...prev,
      whyChooseUs: prev.whyChooseUs.filter((_, i) => i !== index)
    }));
  };

  const handleWhyChooseChange = (index: number, field: "title" | "desc", value: string) => {
    setForm((prev) => {
      const copy = [...prev.whyChooseUs];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, whyChooseUs: copy };
    });
  };

  // ─────────────────────────────────────────────────────────────
  // SUBMISSION
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a service title.");
      return;
    }

    const finalSlug = createSlug(form.slug || form.title);
    if (!finalSlug) {
      toast.error("Please provide a valid URL slug.");
      return;
    }

    if (isDuplicateSlug) {
      toast.error(`A service with the slug "${finalSlug}" already exists. Please choose a unique slug.`);
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEdit ? "Updating service..." : "Creating service...");

    const activeVideo = form.youtubeUrl.trim() || form.video.trim();
    const activeVideoThumb = form.youtubeUrl ? getYouTubeThumbnailUrl(form.youtubeUrl) || "" : form.videoThumbnail;

    const primaryThumb = form.thumbnail || form.image || form.images[0] || "";

    const payload = {
      title: form.title.trim(),
      slug: finalSlug,
      image: primaryThumb,
      thumbnail: primaryThumb,
      mediaType: form.mediaType,
      images: form.images.length > 0 ? form.images : (primaryThumb ? [primaryThumb] : []),
      video: activeVideo,
      videoThumbnail: activeVideoThumb,
      bannerImage: form.bannerImage,
      bannerSubtitle: form.bannerSubtitle.trim(),
      shortDesc: form.shortDesc.trim(),
      fullDesc: form.fullDesc,
      features: form.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
      whyChooseUs: form.whyChooseUs.filter((w) => w.title.trim() || w.desc.trim()),
      techStack: form.techStack && form.techStack.length > 0
        ? form.techStack
        : form.techStackText.split(",").map((t) => t.trim()).filter(Boolean),
      pricingPlans: form.pricingPlans.map((p) => ({
        name: p.name.trim() || "Standard Plan",
        price: Number(p.price) || 0,
        discountPrice: Number(p.discountPrice) || 0,
        period: p.period?.trim() || "One-Time Setup",
        badge: p.badge?.trim() || "",
        description: p.description?.trim() || "",
        features: p.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
        isPopular: Boolean(p.isPopular)
      })),
      order: Number(form.order) || 1
    };

    try {
      let res: Response;
      if (isEdit && form._id) {
        res = await fetch("/api/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: form._id, ...payload })
        });
      } else {
        res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const resData = await res.json();
      toast.dismiss(toastId);

      if (!res.ok || !resData.success) {
        toast.error(resData.message || "Failed to save service.");
        return;
      }

      toast.success(isEdit ? "Service successfully updated!" : "Service successfully created!");
      router.push("/dashboard/services");
      router.refresh();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  const hasVideo = Boolean(form.youtubeUrl || form.video);

  return (
    <div className="w-full space-y-6 pb-20">
      {/* ════════════════════════ TOP ACTION BAR ════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#131417] p-4 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/services"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>
          <div className="h-5 w-px bg-slate-200 dark:bg-gray-800 hidden sm:block" />
          <div className="min-w-0">
            <h1
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate max-w-[280px] sm:max-w-md lg:max-w-xl"
              title={isEdit ? `Edit Service: ${form.title || "Untitled"}` : "Create New Service"}
            >
              <Server className="w-5 h-5 text-[#0167D6] shrink-0" />
              <span className="truncate">{isEdit ? `Edit Service: ${form.title || "Untitled"}` : "Create New Service"}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Link
            href="/dashboard/services"
            className="px-4 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </Link>

          {isEdit && form.slug && (
            <a
              href={`http://localhost:3000/services/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[4px] border border-blue-200 dark:border-blue-800 text-[#0167D6] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            >
              <ExternalLink size={13} /> View Live
            </a>
          )}

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving || isDuplicateSlug}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{isEdit ? "Update Service" : "Publish Service"}</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════ 2-COLUMN MASTER LAYOUT ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Core Overview & Identity */}
          <div className="bg-white dark:bg-[#131417] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-gray-800">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                1
              </span>
              Service Overview &amp; Meta
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Service Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Web &amp; Cloud Applications"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                URL Slug (/services/slug) *
              </label>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center flex-1 rounded-[4px] border overflow-hidden transition ${
                    isDuplicateSlug
                      ? "border-red-500 bg-red-50/10"
                      : "border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-[#18191D] focus-within:border-[#0167D6]"
                  }`}
                >
                  <span className="px-3 py-2 bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 text-xs font-mono border-r border-slate-300 dark:border-gray-700 shrink-0 select-none">
                    /services/
                  </span>
                  <input
                    type="text"
                    placeholder="modern-web-cloud-applications"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent text-xs text-slate-900 dark:text-white font-mono focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, slug: createSlug(form.title) })}
                  className="px-3 py-2 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-[4px] text-xs font-medium cursor-pointer shrink-0"
                >
                  Auto-Generate
                </button>
              </div>
              {isDuplicateSlug ? (
                <p className="text-red-500 text-[11px] mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> This slug is already used by another service. Please enter a unique slug.
                </p>
              ) : form.slug ? (
                <p className="text-emerald-600 dark:text-emerald-400 text-[11px] mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Live URL: /services/{createSlug(form.slug)}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Card Short Summary Description *
              </label>
              <Textarea
                rows={3}
                placeholder="Brief 2-3 sentence overview shown on /services listing cards and search previews."
                value={form.shortDesc}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6] leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Card 2: Deep Showcase & Rich Content */}
          <div className="bg-white dark:bg-[#131417] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-gray-800">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Detailed Showcase &amp; Rich Content
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Details Hero Subtitle / Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Custom, scalable, and high-performance digital platforms tailored to your business"
                value={form.bannerSubtitle}
                onChange={(e) => setForm({ ...form, bannerSubtitle: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Comprehensive Service Overview *
              </label>
              <RichTextEditor
                value={form.fullDesc}
                onChange={(html) => setForm({ ...form, fullDesc: html })}
                placeholder="Detail your engineering capabilities, architecture, client deliverables, and technical process..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Technologies &amp; Frameworks Utilized
              </label>
              <TechnologyIconPicker
                selected={form.techStack || []}
                onChange={(icons) => setForm({ ...form, techStack: icons })}
              />
            </div>

            {/* Why Choose Okobiz points */}
            <div className="pt-2 border-t border-slate-100 dark:border-gray-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-[#0167D6]" /> &ldquo;Why Choose Okobiz for this Service&rdquo; Highlights
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    Key differentiators showcased on the public service detail page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddWhyChoose}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#0167D6] bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-[4px] transition cursor-pointer"
                >
                  <Plus size={13} /> Add Point
                </button>
              </div>

              <div className="space-y-2.5">
                {form.whyChooseUs.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-[#18191D] border border-slate-200 dark:border-gray-800 rounded-[4px]"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Benefit title (e.g. 99.9% Uptime SLA)"
                        value={item.title}
                        onChange={(e) => handleWhyChooseChange(idx, "title", e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-semibold text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Short client explanation..."
                        value={item.desc}
                        onChange={(e) => handleWhyChooseChange(idx, "desc", e.target.value)}
                        className="sm:col-span-2 px-3 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveWhyChoose(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition cursor-pointer shrink-0"
                      title="Remove Point"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Pricing Packages */}
          <div className="bg-white dark:bg-[#131417] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="text-[#0167D6]" size={15} /> Service Pricing &amp; Packages ({form.pricingPlans.length})
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    Transparent solution tiers (e.g. Starter, Business, Enterprise) shown on the public service page.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAddPlan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus size={14} /> Add Package Tier
              </button>
            </div>

            {/* Lean Pricing Plans Cards */}
            {form.pricingPlans.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[4px]">
                <Tag className="mx-auto text-slate-300 dark:text-gray-600 mb-2" size={32} />
                <p className="text-xs font-semibold text-slate-600 dark:text-gray-300">No pricing plans added</p>
                <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1 mb-3">
                  Clients will see a direct &ldquo;Request Custom Quote&rdquo; button instead.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddPlan}
                  className="px-3 py-1.5 rounded-[4px] bg-[#0167D6] text-white text-xs font-bold hover:bg-blue-600 cursor-pointer shadow-xs"
                >
                  Add First Package
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {form.pricingPlans.map((plan, idx) => {
                  const featuresCount = plan.featuresText
                    ? plan.featuresText.split("\n").filter((f) => f.trim().length > 0).length
                    : 0;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-[4px] border flex flex-col justify-between transition shadow-2xs ${
                        plan.isPopular
                          ? "border-[#0167D6] bg-blue-50/25 dark:bg-blue-950/20 ring-1 ring-blue-500/30"
                          : "border-slate-200 dark:border-gray-800 bg-white dark:bg-[#15171B]"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                            Tier #{idx + 1}
                          </span>
                          {plan.isPopular && (
                            <span className="px-2 py-0.5 rounded-[3px] bg-amber-500 text-white text-white-always text-[9.5px] font-bold">
                              POPULAR
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {plan.name || "Untitled Tier"}
                        </h4>

                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-[#0167D6] font-mono">
                            ৳ {Number(plan.price || 0).toLocaleString("en-IN")}
                          </span>
                          {plan.discountPrice ? (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              ৳ {Number(plan.discountPrice).toLocaleString("en-IN")}
                            </span>
                          ) : null}
                          {plan.period && (
                            <span className="text-[10.5px] text-slate-500 dark:text-gray-400 truncate">
                              ({plan.period})
                            </span>
                          )}
                        </div>

                        {plan.description && (
                          <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-1">
                            {plan.description}
                          </p>
                        )}

                        <div className="text-[11px] text-slate-600 dark:text-gray-400 font-medium pt-1 flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-500" />
                          <span>{featuresCount} Features Listed</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-gray-800/80">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPlan(idx)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-slate-100 dark:bg-white/5 hover:bg-[#0167D6] hover:text-white text-slate-700 dark:text-gray-300 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-transparent transition cursor-pointer"
                          title="Edit Package"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePricingPlan(idx)}
                          className="p-1 rounded-[4px] text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                          title="Delete Package"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pricing Plan Edit / Add Modal */}
            {isPlanModalOpen && (
              <div
                onClick={() => setIsPlanModalOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150 cursor-pointer"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-lg shadow-2xl flex flex-col max-h-[90vh] cursor-default overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[#0167D6]" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {editingPlanIndex !== null ? "Edit Package Tier" : "Add Package Tier"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPlanModalOpen(false)}
                      className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-3.5 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                          Package Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Starter, Pro, Enterprise"
                          value={planDraft.name}
                          onChange={(e) => setPlanDraft({ ...planDraft, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#0167D6]"
                          required
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                          Billing Period / Cycle
                        </label>
                        <input
                          type="text"
                          placeholder="One-Time Setup, /month, /year"
                          value={planDraft.period}
                          onChange={(e) => setPlanDraft({ ...planDraft, period: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#0167D6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                          Price (BDT) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="20000"
                          value={planDraft.price || ""}
                          onChange={(e) => setPlanDraft({ ...planDraft, price: Number(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#0167D6]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                          Regular / Strike Price (Optional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 25000"
                          value={planDraft.discountPrice || ""}
                          onChange={(e) => setPlanDraft({ ...planDraft, discountPrice: Number(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#0167D6]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(planDraft.isPopular)}
                          onChange={(e) => setPlanDraft({ ...planDraft, isPopular: e.target.checked })}
                          className="rounded text-[#0167D6] focus:ring-0"
                        />
                        <span>Highlight as &ldquo;POPULAR&rdquo; or Recommended Tier</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Short Summary Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Best suited for high-growth software and enterprise automation"
                        value={planDraft.description || ""}
                        onChange={(e) => setPlanDraft({ ...planDraft, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Included Features (1 per line)
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        value={planDraft.featuresText}
                        onChange={(e) => setPlanDraft({ ...planDraft, featuresText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#0167D6]"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#101114]">
                    <button
                      type="button"
                      onClick={() => setIsPlanModalOpen(false)}
                      className="px-4 py-2 rounded-[4px] bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePlanDraft}
                      className="px-4 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold cursor-pointer shadow-xs"
                    >
                      Save Package
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Media & Publishing Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card A: Media Assets & Visual Showcase (Videos & Multiple Images) */}
          <div className="bg-white dark:bg-[#131417] p-5 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                  A
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Media Showcase
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
                {form.images.length + (hasVideo ? 1 : 0)} Asset(s)
              </span>
            </div>


            {/* ── VIDEO SECTION (Clearly Single Slot) ── */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#18191D] border border-slate-200 dark:border-gray-800 rounded-[4px] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Film size={14} className="text-[#0167D6]" />
                  <span className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                    Demo / Walkthrough Video
                  </span>
                </div>
                {hasVideo && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    Ready
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                  YouTube Video Link
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtubeUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      youtubeUrl: val,
                      mediaType: val ? "video" : prev.mediaType,
                    }));
                  }}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1 flex items-center justify-between">
                  <span>Or Upload MP4 File</span>
                  {uploadingVideo && <Loader2 size={12} className="animate-spin text-[#0167D6]" />}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Direct MP4 video URL"
                    value={form.video}
                    onChange={(e) => setForm((prev) => ({ ...prev, video: e.target.value, mediaType: "video" }))}
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-800 dark:text-white text-xs font-bold rounded-[4px] shrink-0 cursor-pointer"
                  >
                    Upload
                  </button>
                </div>
              </div>

              {/* Video Preview */}
              {(form.youtubeUrl || form.video) && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-gray-800">
                  <div className="relative aspect-video rounded overflow-hidden bg-black border border-slate-300 dark:border-gray-700">
                    {isYouTubeUrl(form.youtubeUrl || form.video) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(form.youtubeUrl || form.video) || ""}
                        title="YouTube Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : form.video ? (
                      <video src={form.video} controls className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  {form.mediaType !== "video" && (
                    <button
                      type="button"
                      onClick={handleSetVideoAsFront}
                      className="mt-2 w-full py-1 text-center text-[11px] font-bold text-[#0167D6] bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 rounded transition"
                    >
                      Set Video as Front Showcase
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── MULTIPLE IMAGES SECTION (CLEAR VISUAL CLUE WITHOUT TEXT) ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Images size={15} className="text-[#0167D6]" />
                  <span className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                    Gallery &amp; Screenshots ({form.images.length})
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400">
                  Select Multiple Files
                </span>
              </div>

              {/* Visual Multi-Image Drag & Drop / Upload Area */}
              <input
                ref={multiImagesInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleMultipleImagesUpload(e.target.files)}
              />

              <div
                onClick={() => multiImagesInputRef.current?.click()}
                className="relative group border-2 border-dashed border-[#0167D6]/40 hover:border-[#0167D6] bg-blue-50/20 hover:bg-blue-50/40 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 rounded-[4px] p-4 text-center cursor-pointer transition"
              >
                {/* Visual Stacked Multi-Photo Clue */}
                <div className="flex items-center justify-center -space-x-3 mb-2.5">
                  <div className="w-10 h-10 rounded border-2 border-white dark:border-[#131417] bg-blue-200/80 dark:bg-blue-900/40 shadow-sm flex items-center justify-center -rotate-6 transform transition group-hover:-rotate-12">
                    <ImageIcon size={18} className="text-[#0167D6]" />
                  </div>
                  <div className="w-11 h-11 rounded border-2 border-white dark:border-[#131417] bg-[#0167D6] text-white shadow-md flex items-center justify-center z-10 transform transition group-hover:scale-105">
                    <Plus size={22} className="stroke-[2.5]" />
                  </div>
                  <div className="w-10 h-10 rounded border-2 border-white dark:border-[#131417] bg-blue-300/80 dark:bg-blue-800/40 shadow-sm flex items-center justify-center rotate-6 transform transition group-hover:rotate-12">
                    <Images size={18} className="text-[#0167D6]" />
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-gray-200">
                  {uploadingMultiImages ? (
                    <span className="flex items-center justify-center gap-1.5 text-[#0167D6]">
                      <Loader2 size={14} className="animate-spin" /> Uploading multiple files...
                    </span>
                  ) : (
                    <span>Click or Drag to Upload Multiple Images</span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-[#0167D6] dark:bg-blue-900/30 dark:text-blue-300 font-bold">
                    PNG
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-[#0167D6] dark:bg-blue-900/30 dark:text-blue-300 font-bold">
                    JPG
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-[#0167D6] dark:bg-blue-900/30 dark:text-blue-300 font-bold">
                    WEBP
                  </span>
                </div>
              </div>
            </div>

            {/* ── INTERACTIVE THUMBNAIL TRAY (SELECT FRONT THUMBNAIL) ── */}
            <div className="pt-3 border-t border-slate-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
                    Select Front Thumbnail:
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-gray-400">
                  Click thumbnail to set as front
                </span>
              </div>

              {form.images.length === 0 && !hasVideo ? (
                <div className="p-4 text-center border border-dashed border-slate-200 dark:border-gray-800 rounded bg-slate-50/50 dark:bg-[#18191D]/30">
                  <p className="text-[11px] text-slate-400 dark:text-gray-500">
                    No images or video uploaded yet. Upload media above to choose your front showcase thumbnail.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {/* Video Thumbnail (if present) */}
                  {hasVideo && (
                    <div
                      onClick={handleSetVideoAsFront}
                      className={`relative group aspect-square rounded-[4px] overflow-hidden border cursor-pointer transition ${
                        form.mediaType === "video"
                          ? "border-[#0167D6] ring-2 ring-[#0167D6]/50 shadow-md"
                          : "border-slate-200 dark:border-gray-800 hover:border-slate-400"
                      }`}
                    >
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                        {form.youtubeUrl ? (
                          <img
                            src={getYouTubeThumbnailUrl(form.youtubeUrl) || ""}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                            <Video size={20} className="text-blue-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play size={18} className="text-white fill-white" />
                        </div>
                      </div>

                      {form.mediaType === "video" ? (
                        <span className="absolute top-1 left-1 bg-[#0167D6] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 z-10">
                          <Star size={9} className="fill-white" /> Front
                        </span>
                      ) : (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span className="text-[9px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded">
                            Set Front
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Thumbnails */}
                  {form.images.map((img, idx) => {
                    const isFront = form.mediaType === "image" && (form.thumbnail === img || form.image === img);
                    return (
                      <div
                        key={idx}
                        className={`relative group aspect-square rounded-[4px] overflow-hidden border bg-slate-100 dark:bg-black cursor-pointer transition ${
                          isFront
                            ? "border-[#0167D6] ring-2 ring-[#0167D6]/50 shadow-md"
                            : "border-slate-200 dark:border-gray-800 hover:border-slate-400"
                        }`}
                        onClick={() => handleSetFrontThumbnail(img)}
                      >
                        <img
                          src={img}
                          alt={`Service ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />

                        {isFront ? (
                          <span className="absolute top-1 left-1 bg-[#0167D6] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 z-10">
                            <Star size={9} className="fill-white" /> Front
                          </span>
                        ) : (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="text-[9px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded">
                              Set Front
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-700 z-20"
                          title="Remove image"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── HERO BANNER BACKGROUND IMAGE ── */}
            <div className="pt-3 border-t border-slate-200 dark:border-gray-800 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">
                Hero Banner Background Image (Wide)
              </label>

              {form.bannerImage ? (
                <div className="relative group rounded overflow-hidden aspect-[21/9] bg-slate-900 border border-slate-200 dark:border-gray-800">
                  <img
                    src={form.bannerImage}
                    alt="Banner Background"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, bannerImage: "" }))}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition shadow"
                    title="Remove Banner"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : null}

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-white text-xs font-bold rounded-[4px] cursor-pointer transition shadow-xs"
              >
                {uploadingBanner ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={14} />}
                <span>{uploadingBanner ? "Uploading..." : form.bannerImage ? "Replace Hero Banner" : "Upload Hero Banner"}</span>
              </button>
            </div>
          </div>

          {/* Card B: Publishing & Organization Settings */}
          <div className="bg-white dark:bg-[#131417] p-5 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-200 dark:border-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                B
              </span>
              Publishing Settings
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={form.order}
                onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) || 1 }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
              <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                Defines sorting position on the public /services showcase grid.
              </p>
            </div>

            {isEdit && form.slug && (
              <div className="pt-2 border-t border-slate-100 dark:border-gray-800">
                <a
                  href={`http://localhost:3000/services/${form.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-[4px] bg-blue-50 dark:bg-blue-900/20 text-[#0167D6] dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition"
                >
                  <Eye size={13} /> View Live Service Page
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
