"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Package, Loader2 } from "lucide-react";
import { isYouTubeUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import {
  ProductFormState,
  PricingPlanForm,
  ProductReviewForm,
  DEFAULT_PRODUCT_FORM as DEFAULT_FORM,
} from "@/components/products/types";
import ProductModal from "@/components/products/ProductModal";
import ProductTable from "@/components/products/ProductTable";
import { createSlug } from "@/lib/slug";

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");

  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);

  // Upload progress states
  const [uploadingMultiImages, setUploadingMultiImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (e) {
      console.warn("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setSlugError("");
    setForm({
      ...DEFAULT_FORM,
      order: products.length + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setSlugError("");
    const isYt = isYouTubeUrl(item.video);
    setForm({
      title: item.title || "",
      slug: item.slug || item._id || "",
      tagline: item.tagline || "",
      category: item.category || "SaaS & ERP",
      customCategory: "",
      mediaType: item.mediaType || (item.video ? "video" : "image"),
      thumbnail: item.thumbnail || item.images?.[0] || "",
      images: Array.isArray(item.images) ? item.images : [],
      video: isYt ? "" : item.video || "",
      videoThumbnail: item.videoThumbnail || "",
      youtubeUrl: isYt ? item.video : "",
      liveUrl: item.liveUrl || "",
      whatsappNumber: item.whatsappNumber || "+8801973590937",
      popularBadge: Boolean(item.popularBadge),
      featuredBadge: Boolean(item.featuredBadge),
      order: item.order || 1,
      status: item.status || "active",
      description: item.description || "",
      featuresText: Array.isArray(item.features) ? item.features.join("\n") : "",
      pricingPlans:
        Array.isArray(item.pricingPlans) && item.pricingPlans.length > 0
          ? item.pricingPlans.map((p: any) => ({
              name: p.name || "Plan",
              price: p.price || 0,
              discountPrice: p.discountPrice || 0,
              period: p.period || "One-Time Setup",
              badge: p.badge || "",
              description: p.description || "",
              featuresText: Array.isArray(p.features)
                ? p.features.join("\n")
                : p.features || "",
              isPopular: Boolean(p.isPopular),
            }))
          : DEFAULT_FORM.pricingPlans,
      reviews:
        Array.isArray(item.reviews) && item.reviews.length > 0
          ? item.reviews.map((r: any) => ({
              name: r.name || "",
              designation: r.designation || "",
              company: r.company || "",
              location: r.location || "",
              rating: Number(r.rating) || 5,
              comment: r.comment || "",
              tag: r.tag || "",
            }))
          : DEFAULT_FORM.reviews,
    });
    setModalOpen(true);
  };

  // Slug validation & input helpers
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
    const taken = products.some(
      (p) =>
        (currentId ? p._id !== currentId : true) &&
        ((p.slug && p.slug.toLowerCase() === clean) ||
          (p._id && p._id.toLowerCase() === clean))
    );
    if (taken) {
      setSlugError(
        `The slug "/products/${clean}" is already in use by another product. Please choose a unique slug.`
      );
      return false;
    }
    setSlugError("");
    return true;
  };

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    setForm((prev) => ({ ...prev, slug: clean }));
    validateSlug(clean, editItem?._id);
  };

  const handleTitleChange = (newTitle: string) => {
    setForm((prev) => {
      const updates: Partial<ProductFormState> = { title: newTitle };
      if (!editItem || !prev.slug || prev.slug === createSlug(prev.title)) {
        const autoSlug = createSlug(newTitle);
        updates.slug = autoSlug;
        validateSlug(autoSlug, undefined);
      }
      return { ...prev, ...updates };
    });
  };

  // Media upload handlers
  const handleMultipleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingMultiImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) continue;
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
      }
    } catch (e) {
      alert("Error uploading images");
    } finally {
      setUploadingMultiImages(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      alert("Video exceeds 200MB limit.");
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
      } else {
        alert(data.message || "Failed to upload video");
      }
    } catch (e) {
      alert("Error uploading video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setForm((prev) => {
      const newImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newThumb = prev.thumbnail;
      if (prev.thumbnail === prev.images[indexToRemove]) {
        newThumb = newImages[0] || "";
      }
      return { ...prev, images: newImages, thumbnail: newThumb };
    });
  };

  const setImageAsCover = (imgUrl: string) => {
    setForm((prev) => ({ ...prev, thumbnail: imgUrl }));
  };

  // Reviews & Pricing plan helpers
  const addReview = () => setForm((prev) => ({
    ...prev,
    reviews: [...prev.reviews, {
      name: "New Client", designation: "Managing Director", company: "Enterprise Company Ltd.",
      location: "Dhaka", rating: 5, comment: "Client feedback highlighting key benefits, speed, and business ROI...",
      tag: form.category !== "Custom" ? form.category : "Verified Deployment",
    }]
  }));
  const updateReview = (index: number, field: keyof ProductReviewForm, value: any) => setForm((prev) => {
    const updated = [...prev.reviews];
    updated[index] = { ...updated[index], [field]: value };
    return { ...prev, reviews: updated };
  });
  const removeReview = (index: number) => setForm((prev) => ({
    ...prev, reviews: prev.reviews.filter((_, idx) => idx !== index)
  }));

  const addPricingPlan = () => setForm((prev) => ({
    ...prev,
    pricingPlans: [...prev.pricingPlans, {
      name: "New Tier Plan", price: 20000, discountPrice: 25000, period: "One-Time Setup",
      badge: "", description: "Plan description & target audience",
      featuresText: "Core Feature 1\nCore Feature 2\nDedicated Support", isPopular: false,
    }]
  }));
  const updatePricingPlan = (index: number, field: keyof PricingPlanForm, value: any) => setForm((prev) => {
    const updated = [...prev.pricingPlans];
    updated[index] = { ...updated[index], [field]: value };
    return { ...prev, pricingPlans: updated };
  });
  const removePricingPlan = (index: number) => setForm((prev) => ({
    ...prev, pricingPlans: prev.pricingPlans.filter((_, idx) => idx !== index)
  }));

  // Save product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter a product title.");
      return;
    }

    const cleanSlug = createSlug(form.slug || form.title || "");
    if (!cleanSlug) {
      setSlugError("Please enter a valid page slug.");
      alert("Please enter a valid page slug.");
      return;
    }

    if (!validateSlug(cleanSlug, editItem?._id)) {
      alert(
        slugError ||
          `The slug "/products/${cleanSlug}" is already taken by another product.`
      );
      return;
    }

    setSaving(true);
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
        form.category === "Custom" && form.customCategory.trim()
          ? form.customCategory.trim()
          : form.category;

      const payload = {
        title: form.title.trim(),
        slug: cleanSlug,
        tagline: form.tagline.trim(),
        category: finalCategory,
        mediaType: form.mediaType,
        thumbnail: primaryThumb,
        images:
          form.images.length > 0
            ? form.images
            : form.thumbnail
            ? [form.thumbnail]
            : [],
        video: activeVideo,
        videoThumbnail: activeVideoThumb,
        liveUrl: form.liveUrl.trim(),
        whatsappNumber: form.whatsappNumber.trim() || "+8801973590937",
        popularBadge: form.popularBadge,
        featuredBadge: form.featuredBadge,
        order: Number(form.order) || 1,
        status: form.status,
        description: form.description,
        features: form.featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        pricingPlans: form.pricingPlans.map((p) => ({
          name: p.name,
          price: Number(p.price) || 0,
          discountPrice: Number(p.discountPrice) || 0,
          period: p.period,
          badge: p.badge,
          description: p.description,
          features: p.featuresText
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean),
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
        method: editItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editItem ? { _id: editItem._id, ...payload } : payload
        ),
      });
      const resJson = await res.json();
      if (!resJson.success) {
        if (resJson.message?.toLowerCase().includes("slug")) {
          setSlugError(resJson.message);
        }
        alert(resJson.message || "Failed to save product.");
        return;
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? All images and uploaded videos will be permanently purged."
      )
    ) {
      return;
    }
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  // Filter & Pagination logic
  const filtered = products.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const categories = [
    "All",
    "SaaS & ERP",
    "Healthcare & Pharmacy",
    "Restaurant & Food",
    "Retail & Supermarket",
    "Education & School",
    "Accounting & Billing",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Finished Products & SaaS Systems
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-[4px] bg-blue-50 text-[#0167D6] border border-blue-200 dark:bg-blue-900/30 dark:text-[#3368B2] dark:border-blue-800/40 font-bold">
              {products.length} Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            Showcase, sell, and configure finished software products with multiple
            screenshots, front videos, rich text descriptions, and editable
            pricing plans.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#15171C] border border-slate-200 dark:border-gray-800 rounded-[4px] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
          />
          <input
            type="text"
            placeholder="Search products by title, slug, ERP, SaaS..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-[4px] transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0167D6] text-white text-white-always shadow-xs"
                  : "bg-slate-100 dark:bg-[#0E0F12] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#0167D6] dark:text-[#3368B2] animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-gray-400">Loading products catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#15171C] rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs">
          <Package className="w-12 h-12 text-slate-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-gray-300">No products found</h3>
          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 max-w-sm mx-auto">
            {search
              ? "No products matched your search query."
              : "You haven't added any products yet. Click 'Add New Product' to get started."}
          </p>
        </div>
      ) : (
        <ProductTable
          products={products}
          paginated={paginated}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          openEdit={openEdit}
          handleDelete={handleDelete}
          openCreate={openCreate}
        />
      )}

      {/* CREATE / EDIT MODAL */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editItem={editItem}
        form={form}
        setForm={setForm}
        saving={saving}
        slugError={slugError}
        handleSlugChange={handleSlugChange}
        handleTitleChange={handleTitleChange}
        handleSaveProduct={handleSaveProduct}
        uploadingVideo={uploadingVideo}
        uploadingMultiImages={uploadingMultiImages}
        handleVideoUpload={handleVideoUpload}
        handleMultipleImagesUpload={handleMultipleImagesUpload}
        setImageAsCover={setImageAsCover}
        removeGalleryImage={removeGalleryImage}
        addReview={addReview}
        updateReview={updateReview}
        removeReview={removeReview}
        addPricingPlan={addPricingPlan}
        updatePricingPlan={updatePricingPlan}
        removePricingPlan={removePricingPlan}
      />
    </div>
  );
}
