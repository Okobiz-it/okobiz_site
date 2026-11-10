"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Save,
  Loader2,
  Tag,
  ImageIcon,
  Layers,
  DollarSign,
  ExternalLink,
  Check,
  Video,
  Film,
  Play,
  Star,
  Plus,
  Trash2,
  Trash,
  Images,
  Quote,
  Sparkles,
  Link2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Phone,
  Eye,
  X
} from "lucide-react";
import {
  ProductFormState,
  PricingPlanForm,
  ProductReviewForm,
  DEFAULT_PRODUCT_FORM,
} from "./types";
import RichTextEditor from "@/components/RichTextEditor";
import TechnologyIconPicker from "@/components/TechnologyIconPicker";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { createSlug } from "@/lib/slug";
import { toast } from "@/lib/toast";

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(DEFAULT_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [productsList, setProductsList] = useState<any[]>([]);

  // Media upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingMultiImages, setUploadingMultiImages] = useState(false);

  // File input refs
  const multiImagesInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const directImageUrlRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setProductsList(d.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      const isYt = isYouTubeUrl(initialData.video);
      setForm({
        title: initialData.title || "",
        slug: initialData.slug || initialData._id || "",
        tagline: initialData.tagline || "",
        category: initialData.category || "SaaS & ERP",
        customCategory: "",
        mediaType: initialData.mediaType || (initialData.video ? "video" : "image"),
        thumbnail: initialData.thumbnail || initialData.images?.[0] || "",
        images: Array.isArray(initialData.images) ? initialData.images : [],
        video: isYt ? "" : initialData.video || "",
        videoThumbnail: initialData.videoThumbnail || "",
        youtubeUrl: isYt ? initialData.video : "",
        liveUrl: initialData.liveUrl || "",
        whatsappNumber: initialData.whatsappNumber || "+8801973590937",
        popularBadge: Boolean(initialData.popularBadge),
        featuredBadge: Boolean(initialData.featuredBadge),
        order: initialData.order || 1,
        status: initialData.status || "active",
        description: initialData.description || "",
        featuresText: Array.isArray(initialData.features) ? initialData.features.join("\n") : "",
        techStack: Array.isArray(initialData.techStack) && initialData.techStack.length > 0
          ? initialData.techStack
          : (DEFAULT_PRODUCT_FORM.techStack || ["Next.js", "React", "Node.js", "PostgreSQL", "Tailwind CSS"]),
        pricingPlans: Array.isArray(initialData.pricingPlans)
          ? initialData.pricingPlans.map((p: any) => ({
              name: p.name || "",
              price: p.price || 0,
              discountPrice: p.discountPrice || 0,
              period: p.period || "/month",
              badge: p.badge || "",
              description: p.description || "",
              featuresText: Array.isArray(p.features) ? p.features.join("\n") : "",
              isPopular: Boolean(p.isPopular),
            }))
          : [],
        reviews: Array.isArray(initialData.reviews)
          ? initialData.reviews.map((r: any) => ({
              name: r.name || "",
              designation: r.designation || "",
              company: r.company || "",
              location: r.location || "",
              rating: r.rating || 5,
              comment: r.comment || "",
              tag: r.tag || "",
            }))
          : [],
      });
    }
  }, [initialData]);

  const validateSlug = (slugVal: string, currentId?: string): boolean => {
    const clean = slugVal
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!clean) {
      setSlugError("Page slug cannot be empty.");
      return false;
    }
    const taken = productsList.some(
      (p) =>
        (currentId ? p._id !== currentId : true) &&
        ((p.slug && p.slug.toLowerCase() === clean) ||
          (p._id && p._id.toLowerCase() === clean))
    );
    if (taken) {
      setSlugError(`The slug "/products/${clean}" is already in use by another product.`);
      return false;
    }
    setSlugError("");
    return true;
  };

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    setForm((prev) => ({ ...prev, slug: clean }));
    validateSlug(clean, initialData?._id);
  };

  const handleTitleChange = (newTitle: string) => {
    setForm((prev) => {
      const updates: Partial<ProductFormState> = { title: newTitle };
      if (!isEdit || !prev.slug || prev.slug === createSlug(prev.title)) {
        const autoSlug = createSlug(newTitle);
        updates.slug = autoSlug;
        validateSlug(autoSlug, undefined);
      }
      return { ...prev, ...updates };
    });
  };

  // ─────────────────────────────────────────────────────────────
  // MEDIA HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleMultipleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingMultiImages(true);
    try {
      const uploadedUrls: string[] = [];
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
        setForm((prev) => ({
          ...prev,
          thumbnail: prev.thumbnail || uploadedUrls[0],
          images: [...prev.images, ...uploadedUrls],
        }));
        toast.success(`Uploaded ${uploadedUrls.length} screenshot(s)!`);
      }
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
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

    setForm((prev) => ({
      ...prev,
      thumbnail: prev.thumbnail || val,
      images: [...prev.images, val],
    }));
    input.value = "";
    toast.success("Image URL added to gallery!");
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size cannot exceed 50MB");
      return;
    }
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, video: data.url, mediaType: "video" }));
        toast.success("Demo video uploaded!");
      } else {
        toast.error(data.error || "Failed to upload video.");
      }
    } catch (e: any) {
      toast.error("Video upload error: " + e.message);
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const setImageAsCover = (imgUrl: string) => {
    setForm((prev) => ({ ...prev, thumbnail: imgUrl, mediaType: "image" }));
    toast.success("Set as primary front thumbnail!");
  };

  const setVideoAsCover = () => {
    setForm((prev) => ({ ...prev, mediaType: "video" }));
    toast.success("Set video as primary front showcase!");
  };

  const removeGalleryImage = (idx: number) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== idx);
      const nextThumb =
        prev.thumbnail === prev.images[idx]
          ? nextImages[0] || ""
          : prev.thumbnail;
      return { ...prev, images: nextImages, thumbnail: nextThumb };
    });
  };

  // ─────────────────────────────────────────────────────────────
  // REVIEWS & PRICING PLANS HANDLERS
  // ─────────────────────────────────────────────────────────────
  const addReview = () => {
    setForm((prev) => ({
      ...prev,
      reviews: [
        ...prev.reviews,
        {
          name: "",
          designation: "Founder & CEO",
          company: "",
          location: "Dhaka, Bangladesh",
          rating: 5,
          comment: "",
          tag: "Verified Client",
        },
      ],
    }));
  };

  const updateReview = (index: number, field: keyof ProductReviewForm, value: any) => {
    setForm((prev) => {
      const copy = [...prev.reviews];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, reviews: copy };
    });
  };

  const removeReview = (index: number) => {
    setForm((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((_, i) => i !== index),
    }));
  };

  const addPricingPlan = () => {
    setForm((prev) => ({
      ...prev,
      pricingPlans: [
        ...prev.pricingPlans,
        {
          name: `Tier ${prev.pricingPlans.length + 1}`,
          price: 15000,
          discountPrice: 0,
          period: "/month",
          badge: "",
          description: "",
          featuresText: "Feature 1\nFeature 2\nFeature 3",
          isPopular: false,
        },
      ],
    }));
  };

  const updatePricingPlan = (index: number, field: keyof PricingPlanForm, value: any) => {
    setForm((prev) => {
      const copy = [...prev.pricingPlans];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, pricingPlans: copy };
    });
  };

  const removePricingPlan = (index: number) => {
    setForm((prev) => ({
      ...prev,
      pricingPlans: prev.pricingPlans.filter((_, i) => i !== index),
    }));
  };

  // ─────────────────────────────────────────────────────────────
  // SUBMISSION
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Product title is required.");
      return;
    }

    const cleanSlug = form.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSlug) {
      setSlugError("Please enter a valid page slug.");
      return;
    }

    if (!validateSlug(cleanSlug, initialData?._id)) {
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEdit ? "Updating product..." : "Creating product...");

    try {
      let activeVideo = "";
      if (form.mediaType === "video") {
        if (form.youtubeUrl && isYouTubeUrl(form.youtubeUrl)) {
          activeVideo = form.youtubeUrl.trim();
        } else if (form.video) {
          activeVideo = form.video.trim();
        }
      }

      let activeVideoThumb = form.videoThumbnail;
      if (form.mediaType === "video" && isYouTubeUrl(activeVideo)) {
        const ytThumb = getYouTubeThumbnailUrl(activeVideo);
        if (ytThumb && (!activeVideoThumb || activeVideoThumb.startsWith("/assets/") || activeVideoThumb === form.thumbnail)) {
          activeVideoThumb = ytThumb;
        }
      }

      const primaryThumb =
        form.mediaType === "video" && activeVideoThumb
          ? activeVideoThumb
          : (form.thumbnail || form.images[0] || "/assets/web-2-DujjTO8C.webp");

      const finalCategory =
        form.category === "Custom" && form.customCategory?.trim()
          ? form.customCategory.trim()
          : form.category;

      const payload = {
        title: form.title.trim(),
        slug: cleanSlug,
        tagline: form.tagline.trim(),
        category: finalCategory,
        mediaType: form.mediaType,
        thumbnail: primaryThumb,
        images: form.images.length > 0 ? form.images : (form.thumbnail ? [form.thumbnail] : []),
        video: activeVideo,
        videoThumbnail: activeVideoThumb,
        liveUrl: form.liveUrl.trim(),
        whatsappNumber: form.whatsappNumber.trim() || "+8801973590937",
        popularBadge: form.popularBadge,
        featuredBadge: form.featuredBadge,
        order: Number(form.order) || 1,
        status: form.status,
        description: form.description,
        features: form.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
        techStack: form.techStack || [],
        pricingPlans: form.pricingPlans.map((p) => ({
          name: p.name,
          price: Number(p.price) || 0,
          discountPrice: Number(p.discountPrice) || 0,
          period: p.period,
          badge: p.badge,
          description: p.description,
          features: p.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
          isPopular: p.isPopular,
        })),
        reviews: form.reviews.map((r) => ({
          name: r.name.trim() || "Satisfied Client",
          designation: r.designation.trim(),
          company: r.company.trim(),
          location: r.location.trim(),
          rating: Number(r.rating) || 5,
          comment: r.comment.trim(),
          tag: r.tag.trim(),
        })),
      };

      const res = await fetch("/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit && initialData?._id ? { _id: initialData._id, ...payload } : payload
        ),
      });

      const resJson = await res.json();
      toast.dismiss(toastId);

      if (!resJson.success) {
        if (resJson.message?.toLowerCase().includes("slug")) {
          setSlugError(resJson.message);
        }
        toast.error(resJson.message || "Failed to save product.");
        return;
      }

      toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!");
      router.push("/dashboard/products");
      router.refresh();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to save product.");
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
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <div className="h-5 w-px bg-slate-200 dark:bg-gray-800 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0167D6]" />
                {isEdit ? `Edit Product: ${form.title || "Untitled"}` : "Add New SaaS / Finished Product"}
              </h1>
              {form.slug && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-blue-50 dark:bg-blue-900/30 text-[#0167D6] dark:text-blue-300">
                  /products/{form.slug}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Showcase, price, and sell finished turn-key SaaS systems, ERP solutions, and software products
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Link
            href="/dashboard/products"
            className="px-4 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </Link>

          {isEdit && form.slug && (
            <a
              href={`http://localhost:3000/products/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[4px] border border-blue-200 dark:border-blue-800 text-[#0167D6] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            >
              <ExternalLink size={13} /> View Live Product
            </a>
          )}

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving || Boolean(slugError)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{isEdit ? "Update Product" : "Publish Product"}</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════ 2-COLUMN MASTER LAYOUT ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Product Overview & Meta */}
          <div className="bg-white dark:bg-[#131417] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-gray-800">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                1
              </span>
              Product Overview &amp; Meta
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PharmaCare Pro - Complete Pharmacy Management System &amp; POS"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Custom Page Slug (/products/slug) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-xs font-mono">
                    /products/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="pharmacare-pro"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={`w-full pl-22 pr-3 py-2 bg-slate-50 dark:bg-[#18191D] border rounded-[4px] text-xs text-slate-900 dark:text-white font-mono focus:outline-none ${
                      slugError
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 dark:border-gray-700 focus:border-[#0167D6]"
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const auto = createSlug(form.title);
                    setForm((prev) => ({ ...prev, slug: auto }));
                    validateSlug(auto, initialData?._id);
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-[4px] text-xs font-medium cursor-pointer shrink-0"
                >
                  Auto-Generate
                </button>
              </div>

              {slugError ? (
                <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{slugError}</span>
                </div>
              ) : form.slug ? (
                <p className="text-[11px] text-slate-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  <span>
                    URL available: <strong className="text-emerald-600 dark:text-emerald-300 font-mono">/products/{form.slug}</strong>
                  </span>
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Tagline / Subheading
              </label>
              <input
                type="text"
                placeholder="e.g. Complete Cloud Pharmacy &amp; Medical Store POS, Batch Expiry Tracker &amp; Accounting ERP"
                value={form.tagline}
                onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Core Highlight Bullets (1 per line)
              </label>
              <textarea
                rows={3}
                placeholder="Automated Batch &amp; Expiry Date Alert&#10;Generic Brand Recommendation System&#10;High-Speed Barcode POS Billing"
                value={form.featuresText}
                onChange={(e) => setForm((prev) => ({ ...prev, featuresText: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6] font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Card 2: Detailed Description & Technical Specifications */}
          <div className="bg-white dark:bg-[#131417] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-gray-800">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Detailed Description &amp; Technical Specs
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Complete Product Description *
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
                placeholder="Write comprehensive product description, system architecture, benefits, and workflows..."
                minHeight="280px"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Technology Frameworks &amp; Tools
              </label>
              <TechnologyIconPicker
                selected={form.techStack || []}
                onChange={(newStack) => setForm((prev) => ({ ...prev, techStack: newStack }))}
              />
            </div>
          </div>

          {/* Card 3: Pricing Plans & Turn-Key Packages */}
          <div className="bg-white dark:bg-[#131417] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="text-[#0167D6]" size={15} /> Pricing Packages &amp; Plans ({form.pricingPlans.length})
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    Define license fees, setup costs, or subscription plans for this software product.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addPricingPlan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus size={14} /> Add Tier Plan
              </button>
            </div>

            {form.pricingPlans.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[4px]">
                <Tag className="mx-auto text-slate-300 dark:text-gray-600 mb-2" size={32} />
                <p className="text-xs font-semibold text-slate-600 dark:text-gray-300">No pricing plans defined yet</p>
                <button
                  type="button"
                  onClick={addPricingPlan}
                  className="mt-3 px-3 py-1.5 bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold rounded-[4px] cursor-pointer"
                >
                  Add Starter Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.pricingPlans.map((plan, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-[4px] border ${
                      plan.isPopular
                        ? "border-[#0167D6] bg-blue-50/20 dark:bg-blue-950/10 ring-1 ring-blue-500/30"
                        : "border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-[#18191D]/50"
                    } space-y-3 relative`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                        Tier #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(plan.isPopular)}
                            onChange={(e) => updatePricingPlan(idx, "isPopular", e.target.checked)}
                            className="rounded text-[#0167D6] focus:ring-0"
                          />
                          Popular Badge
                        </label>
                        <button
                          type="button"
                          onClick={() => removePricingPlan(idx)}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                          title="Delete this plan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                          Plan Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Single Store, Multi-Branch"
                          value={plan.name}
                          onChange={(e) => updatePricingPlan(idx, "name", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                          Billing Cycle / Duration
                        </label>
                        <input
                          type="text"
                          placeholder="One-Time Setup, /month, /year"
                          value={plan.period}
                          onChange={(e) => updatePricingPlan(idx, "period", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                          Price (BDT) *
                        </label>
                        <input
                          type="number"
                          placeholder="20000"
                          value={plan.price}
                          onChange={(e) => updatePricingPlan(idx, "price", Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                          Regular / Discount Price
                        </label>
                        <input
                          type="number"
                          placeholder="Optional regular price"
                          value={plan.discountPrice || ""}
                          onChange={(e) => updatePricingPlan(idx, "discountPrice", Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                        Badge Text (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Best Value, Recommended"
                        value={plan.badge || ""}
                        onChange={(e) => updatePricingPlan(idx, "badge", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        placeholder="Target audience or package summary"
                        value={plan.description || ""}
                        onChange={(e) => updatePricingPlan(idx, "description", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1">
                        Included Features (1 per line)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        value={plan.featuresText}
                        onChange={(e) => updatePricingPlan(idx, "featuresText", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Client Reviews & Success Stories */}
          <div className="bg-white dark:bg-[#131417] p-6 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Quote className="text-[#0167D6]" size={15} /> Client Reviews &amp; Testimonials ({form.reviews.length})
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    Rendered in the public review marquee and social proof sections.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addReview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus size={14} /> Add Review
              </button>
            </div>

            {form.reviews.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[4px]">
                <Quote size={28} className="mx-auto text-slate-400 dark:text-gray-600 mb-1" />
                <p className="text-xs font-semibold text-slate-800 dark:text-gray-300">No client reviews added yet</p>
                <button
                  type="button"
                  onClick={addReview}
                  className="mt-3 px-3 py-1.5 bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold rounded-[4px] cursor-pointer"
                >
                  Add First Review
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {form.reviews.map((rev, revIdx) => (
                  <div
                    key={revIdx}
                    className="bg-slate-50 dark:bg-[#18191D] border border-slate-200 dark:border-gray-800 rounded-[4px] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded bg-blue-100 text-[#0167D6] text-xs font-bold flex items-center justify-center">
                          #{revIdx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => updateReview(revIdx, "rating", starVal)}
                              className="focus:outline-none"
                            >
                              <Star
                                size={14}
                                className={
                                  starVal <= rev.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-300 dark:text-gray-600"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeReview(revIdx)}
                        className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                        title="Remove Review"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        placeholder="Client Name (e.g. Tanvir Ahmed)"
                        value={rev.name}
                        onChange={(e) => updateReview(revIdx, "name", e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Designation / Role"
                        value={rev.designation}
                        onChange={(e) => updateReview(revIdx, "designation", e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Company / Organization"
                        value={rev.company}
                        onChange={(e) => updateReview(revIdx, "company", e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Client testimonial / review text..."
                      value={rev.comment}
                      onChange={(e) => updateReview(revIdx, "comment", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Media & Publishing Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card A: Visual Media, Video & Gallery Showcase */}
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

            {/* Media Mode Switcher */}
            <div className="flex rounded-[4px] bg-slate-100 dark:bg-[#18191D] p-1 border border-slate-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, mediaType: "image" }))}
                className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition ${
                  form.mediaType === "image"
                    ? "bg-white dark:bg-[#131417] text-[#0167D6] shadow-xs"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900"
                }`}
              >
                <ImageIcon size={13} /> Still Images
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, mediaType: "video" }))}
                className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition ${
                  form.mediaType === "video"
                    ? "bg-white dark:bg-[#131417] text-[#0167D6] shadow-xs"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900"
                }`}
              >
                <Video size={13} /> Video Showcase
              </button>
            </div>

            {/* ── VIDEO SECTION (Clearly Single Slot) ── */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#18191D] border border-slate-200 dark:border-gray-800 rounded-[4px] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Film size={14} className="text-[#0167D6]" />
                  <span className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                    Product Demo Video
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
                  <span>Or Upload MP4 / WebM File</span>
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
                      onClick={setVideoAsCover}
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
                    Screenshots &amp; Mockups ({form.images.length})
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400">
                  Select Multiple Files
                </span>
              </div>

              {/* Visual Multi-Image Drag & Drop Area */}
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
                {/* Visual Stacked Photo Cards Clue */}
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
                    <span>Click or Drag to Upload Multiple Screenshots</span>
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
                    No images or video uploaded yet. Add media above to choose your primary front showcase thumbnail.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {/* Video Thumbnail (if present) */}
                  {hasVideo && (
                    <div
                      onClick={setVideoAsCover}
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
                    const isFront = form.mediaType === "image" && form.thumbnail === img;
                    return (
                      <div
                        key={idx}
                        className={`relative group aspect-square rounded-[4px] overflow-hidden border bg-slate-100 dark:bg-black cursor-pointer transition ${
                          isFront
                            ? "border-[#0167D6] ring-2 ring-[#0167D6]/50 shadow-md"
                            : "border-slate-200 dark:border-gray-800 hover:border-slate-400"
                        }`}
                        onClick={() => setImageAsCover(img)}
                      >
                        <img
                          src={img}
                          alt={`Product ${idx + 1}`}
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
                            removeGalleryImage(idx);
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
          </div>

          {/* Card B: Publishing & Commercial Settings */}
          <div className="bg-white dark:bg-[#131417] p-5 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-200 dark:border-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                B
              </span>
              Commercial &amp; Visibility Settings
            </h2>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              >
                <option value="SaaS & ERP">SaaS &amp; ERP</option>
                <option value="Healthcare & Pharmacy">Healthcare &amp; Pharmacy</option>
                <option value="Restaurant & Food">Restaurant &amp; Food</option>
                <option value="Retail & Supermarket">Retail &amp; Supermarket</option>
                <option value="Education & School">Education &amp; School</option>
                <option value="Accounting & Billing">Accounting &amp; Billing</option>
                <option value="Custom">Custom Category...</option>
              </select>
              {form.category === "Custom" && (
                <input
                  type="text"
                  placeholder="Type custom category name..."
                  value={form.customCategory}
                  onChange={(e) => setForm((prev) => ({ ...prev, customCategory: e.target.value }))}
                  className="w-full mt-2 px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white"
                />
              )}
            </div>

            {/* Display Order */}
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
            </div>

            {/* Live Demo URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <span>Live Demo URL</span>
                <span className="text-[10px] text-slate-500">Opens in preview iframe</span>
              </label>
              <div className="relative">
                <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://demo.product.okobiz.com"
                  value={form.liveUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, liveUrl: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <span>WhatsApp Inquiry Number</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Click-to-Chat</span>
              </label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="+8801973590937"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>
            </div>

            {/* Status & Badges Strip */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-gray-800">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-200 dark:border-gray-800 rounded-[4px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.status === "active"}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.checked ? "active" : "draft" }))
                  }
                  className="rounded border-slate-300 text-[#0167D6] focus:ring-0"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-gray-200">
                  Active &amp; Published on Website
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-200 dark:border-gray-800 rounded-[4px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.popularBadge}
                  onChange={(e) => setForm((prev) => ({ ...prev, popularBadge: e.target.checked }))}
                  className="rounded border-slate-300 text-[#0167D6] focus:ring-0"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" /> Highlight as &ldquo;Most Popular&rdquo;
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-200 dark:border-gray-800 rounded-[4px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featuredBadge}
                  onChange={(e) => setForm((prev) => ({ ...prev, featuredBadge: e.target.checked }))}
                  className="rounded border-slate-300 text-[#0167D6] focus:ring-0"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-1">
                  <Star size={12} className="text-[#0167D6]" /> &ldquo;Ready Turnkey SaaS&rdquo; Badge
                </span>
              </label>
            </div>

            {isEdit && form.slug && (
              <div className="pt-2 border-t border-slate-100 dark:border-gray-800">
                <a
                  href={`http://localhost:3000/products/${form.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-[4px] bg-blue-50 dark:bg-blue-900/20 text-[#0167D6] dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition"
                >
                  <Eye size={13} /> View Live Product Page
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
