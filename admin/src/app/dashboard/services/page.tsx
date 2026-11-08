"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Server,
  X,
  ExternalLink,
  UploadCloud,
  ImageIcon,
  Loader2,
  CheckCircle2,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
  ListPlus,
  ArrowRight,
  Tag
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import TechnologyIconPicker from "@/components/TechnologyIconPicker";
import { cleanSnippet } from "@/lib/richText";
import { createSlug } from "@/lib/slug";

interface WhyChooseItem {
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

interface ServiceFormState {
  title: string;
  slug: string;
  image: string;
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

const INITIAL_FORM: ServiceFormState = {
  title: "",
  slug: "",
  image: "",
  bannerImage: "",
  bannerSubtitle: "",
  shortDesc: "",
  fullDesc: "",
  featuresText: "",
  whyChooseUs: [
    { title: "Expert Team", desc: "Highly skilled developers and domain specialists." },
    { title: "Customized Solutions", desc: "Tailored directly to your target audience and conversion goals." }
  ],
  techStackText: "React, Next.js, TypeScript, Node.js, Tailwind CSS",
  techStack: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS"],
  pricingPlans: [],
  order: 1
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<ServiceFormState>(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState<"card" | "details" | "pricing">("card");

  // Image Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const normalizedFormSlug = createSlug(form.slug);
  const isDuplicateSlug = Boolean(
    normalizedFormSlug &&
    services.some(s => s.slug?.toLowerCase().trim() === normalizedFormSlug && s._id !== editItem?._id)
  );

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setServices(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch services:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      ...INITIAL_FORM,
      pricingPlans: [
        {
          name: "Standard Plan",
          price: 15000,
          discountPrice: 20000,
          period: "One-Time Setup",
          badge: "Most Popular",
          description: "Comprehensive solution designed for business growth.",
          featuresText: "Full Service Implementation\nDedicated Support\nFast Turnaround",
          isPopular: true
        }
      ],
      order: services.length + 1
    });
    setActiveTab("card");
    setUploadError("");
    setModalOpen(true);
  };

  const openEdit = (srv: any) => {
    setEditItem(srv);
    const srvTechStack = Array.isArray(srv.techStack)
      ? srv.techStack
      : (srv.techStack ? srv.techStack.split(",").map((t: string) => t.trim()).filter(Boolean) : []);
    setForm({
      title: srv.title || "",
      slug: srv.slug || "",
      image: srv.image || "",
      bannerImage: srv.bannerImage || "",
      bannerSubtitle: srv.bannerSubtitle || "",
      shortDesc: srv.shortDesc || "",
      fullDesc: srv.fullDesc || "",
      featuresText: Array.isArray(srv.features) ? srv.features.join("\n") : "",
      whyChooseUs: Array.isArray(srv.whyChooseUs) && srv.whyChooseUs.length > 0
        ? srv.whyChooseUs
        : [
            { title: "Expert Team", desc: "Highly skilled developers and domain specialists." },
            { title: "Customized Solutions", desc: "Tailored directly to your target audience." }
          ],
      techStackText: srvTechStack.join(", "),
      techStack: srvTechStack,
      pricingPlans: Array.isArray(srv.pricingPlans)
        ? srv.pricingPlans.map((p: any) => ({
            name: p.name || "",
            price: Number(p.price) || 0,
            discountPrice: Number(p.discountPrice) || 0,
            period: p.period || "One-Time Setup",
            badge: p.badge || "",
            description: p.description || "",
            featuresText: Array.isArray(p.features) ? p.features.join("\n") : (p.featuresText || ""),
            isPopular: Boolean(p.isPopular)
          }))
        : [],
      order: srv.order || 1
    });
    setActiveTab("card");
    setUploadError("");
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setForm(prev => {
      const updated = { ...prev, title: val };
      if (!editItem || !prev.slug || prev.slug === createSlug(prev.title)) {
        updated.slug = createSlug(val);
      }
      return updated;
    });
  };

  const addPricingPlan = () => {
    setForm(prev => ({
      ...prev,
      pricingPlans: [
        ...prev.pricingPlans,
        {
          name: `Package #${prev.pricingPlans.length + 1}`,
          price: 15000,
          discountPrice: 20000,
          period: "One-Time Setup",
          badge: "",
          description: "",
          featuresText: "Included Feature 1\nIncluded Feature 2\nIncluded Feature 3",
          isPopular: false
        }
      ]
    }));
  };

  const updatePricingPlan = (index: number, field: keyof PricingPlanForm, value: any) => {
    setForm(prev => {
      const nextPlans = [...prev.pricingPlans];
      nextPlans[index] = { ...nextPlans[index], [field]: value };
      return { ...prev, pricingPlans: nextPlans };
    });
  };

  const removePricingPlan = (index: number) => {
    setForm(prev => ({
      ...prev,
      pricingPlans: prev.pricingPlans.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file: File, type: "image" | "banner") => {
    const isImage = type === "image";
    if (isImage) setUploadingImage(true);
    else setUploadingBanner(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setForm(prev => ({
          ...prev,
          [isImage ? "image" : "bannerImage"]: data.url
        }));
      } else {
        setUploadError(data.error || "Failed to upload image. Please try again.");
      }
    } catch (e: any) {
      setUploadError(e.message || "Upload network error");
    } finally {
      if (isImage) setUploadingImage(false);
      else setUploadingBanner(false);
    }
  };

  const handleAddWhyChoose = () => {
    setForm(prev => ({
      ...prev,
      whyChooseUs: [...prev.whyChooseUs, { title: "", desc: "" }]
    }));
  };

  const handleRemoveWhyChoose = (index: number) => {
    setForm(prev => ({
      ...prev,
      whyChooseUs: prev.whyChooseUs.filter((_, i) => i !== index)
    }));
  };

  const handleWhyChooseChange = (index: number, field: "title" | "desc", value: string) => {
    setForm(prev => {
      const copy = [...prev.whyChooseUs];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, whyChooseUs: copy };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter a service title.");
      return;
    }

    let finalSlug = createSlug(form.slug || form.title);

    const duplicate = services.find(
      s => s.slug?.toLowerCase().trim() === finalSlug && s._id !== editItem?._id
    );
    if (duplicate) {
      alert(`A service with the slug "${finalSlug}" already exists. Please choose a unique URL slug.`);
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: finalSlug,
      image: form.image,
      bannerImage: form.bannerImage,
      bannerSubtitle: form.bannerSubtitle.trim(),
      shortDesc: form.shortDesc.trim(),
      fullDesc: form.fullDesc,
      features: form.featuresText.split("\n").map(f => f.trim()).filter(Boolean),
      whyChooseUs: form.whyChooseUs.filter(w => w.title.trim() || w.desc.trim()),
      techStack: form.techStack && form.techStack.length > 0
        ? form.techStack
        : form.techStackText.split(",").map(t => t.trim()).filter(Boolean),
      pricingPlans: form.pricingPlans.map(p => ({
        name: p.name.trim() || "Standard Plan",
        price: Number(p.price) || 0,
        discountPrice: Number(p.discountPrice) || 0,
        period: p.period?.trim() || "One-Time Setup",
        badge: p.badge?.trim() || "",
        description: p.description?.trim() || "",
        features: p.featuresText.split("\n").map(f => f.trim()).filter(Boolean),
        isPopular: Boolean(p.isPopular)
      })),
      order: Number(form.order) || 1
    };

    try {
      let res: Response;
      if (editItem) {
        res = await fetch("/api/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editItem._id, ...payload })
        });
      } else {
        res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to save service.");
        return;
      }

      setModalOpen(false);
      fetchServices();
    } catch (err: any) {
      alert("Failed to save service: " + err.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also remove its details page.`)) return;
    try {
      await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      fetchServices();
    } catch (e: any) {
      alert("Failed to delete service: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Server className="text-[#0167D6] dark:text-[#3368B2]" size={24} />
            Services & Detailed Offerings
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Manage your client /services cards and build highly customizable details pages for each offering
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus size={16} /> Add New Service
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3368B2]" />
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="bg-[#131417] border border-gray-800 rounded-[4px] p-12 text-center text-gray-400 text-sm">
          <Server className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-white">No services found</p>
          <p className="text-xs text-gray-500 mt-1 mb-5">Click below to create your first service offering</p>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-[4px] bg-[#3368B2] text-white text-xs font-bold"
          >
            Create Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] flex flex-col justify-between group hover:border-[#0167D6] dark:hover:border-[#3368B2]/60 transition overflow-hidden shadow-xs hover:shadow-md"
            >
              {/* Card Header & Media */}
              <div>
                <div className="p-5 border-b border-slate-200 dark:border-gray-800/80 flex items-start justify-between gap-3 bg-slate-50/80 dark:bg-[#181A1F]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[4px] bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                      {srv.image ? (
                        <img
                          src={srv.image}
                          alt={srv.title}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Server className="w-6 h-6 text-[#0167D6] dark:text-[#3368B2]" />
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#0167D6] dark:text-[#3368B2] tracking-wider uppercase">
                        Order #{srv.order || 1}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0167D6] transition">
                        {srv.title}
                      </h3>
                    </div>
                  </div>
                  {srv.pricingPlans && srv.pricingPlans.length > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-[4px] border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                      {srv.pricingPlans.length} {srv.pricingPlans.length === 1 ? "Plan" : "Plans"}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-[#0d0e11] px-2 py-0.5 rounded-[4px] border border-slate-200 dark:border-gray-800 truncate max-w-[210px]">
                      /services/{srv.slug}
                    </span>
                    <a
                      href={`http://localhost:3000/services/${srv.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0167D6] dark:text-[#3368B2] hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 text-[11px] font-medium"
                      title="Open details page"
                    >
                      <span>Preview</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1">
                      Card Description (/services)
                    </div>
                    <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed line-clamp-3 bg-slate-50 dark:bg-[#181A1F]/40 p-2.5 rounded-[4px] border border-slate-200 dark:border-gray-800/60 min-h-[4.5rem]">
                      {cleanSnippet(srv.shortDesc, 140) || (
                        <span className="text-slate-400 dark:text-gray-600 italic">No short description set</span>
                      )}
                    </p>
                  </div>

                  {/* Highlights overview */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-gray-800/60 text-[11px] text-slate-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Layers size={13} className="text-[#0167D6] dark:text-[#3368B2]" />
                      <span>{srv.features?.length || 0} Features</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-emerald-600 dark:text-emerald-500" />
                      <span>{srv.whyChooseUs?.length || 0} Why Choose</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-[#181A1F]/80 border-t border-slate-200 dark:border-gray-800/80">
                <a
                  href={`http://localhost:3000/services/${srv.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-[#0167D6] dark:text-gray-400 dark:hover:text-white transition"
                >
                  <ArrowRight size={13} className="text-[#0167D6] dark:text-[#3368B2]" />
                  <span>View Details</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(srv)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-slate-100 dark:bg-white/5 hover:bg-[#0167D6] hover:text-white text-slate-700 dark:text-gray-300 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-transparent transition"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(srv._id, srv.title)}
                    className="p-1.5 rounded-[4px] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-transparent transition"
                    title="Delete service"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] w-full max-w-3xl my-8 p-6 relative max-h-[92vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-blue-50 dark:bg-[#3368B2]/20 border border-blue-200 dark:border-[#3368B2]/40 flex items-center justify-center text-[#0167D6] dark:text-[#3368B2]">
                  <Server size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {editItem ? `Edit Service: ${editItem.title}` : "Create New Service"}
                  </h2>
                  <p className="text-slate-500 dark:text-gray-400 text-xs">
                    Configure both the /services summary card and its dedicated details page
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white p-1 rounded-[4px] hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-gray-800 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition ${
                  activeTab === "card"
                    ? "border-[#0167D6] text-[#0167D6] bg-blue-50 dark:border-[#3368B2] dark:text-white dark:bg-blue-900/10"
                    : "border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Layers size={14} />
                <span>1. Service Card (/services)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition ${
                  activeTab === "details"
                    ? "border-[#0167D6] text-[#0167D6] bg-blue-50 dark:border-[#3368B2] dark:text-white dark:bg-blue-900/10"
                    : "border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Sparkles size={14} />
                <span>2. Details Page Customization</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition ${
                  activeTab === "pricing"
                    ? "border-[#0167D6] text-[#0167D6] bg-blue-50 dark:border-[#3368B2] dark:text-white dark:bg-blue-900/10"
                    : "border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Tag size={14} />
                <span>3. Pricing Packages</span>
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 pr-1 space-y-6">
              {uploadError && (
                <div className="p-3 bg-red-900/20 border border-red-800/60 rounded-[4px] text-xs text-red-300">
                  {uploadError}
                </div>
              )}

              {/* TAB 1: SERVICE CARD SETTINGS */}
              {activeTab === "card" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                        Service Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={e => handleTitleChange(e.target.value)}
                        placeholder="e.g. Website, Mobile App Design & Development"
                        className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                        URL Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                        placeholder="e.g. website-app-development-service"
                        className={`w-full bg-white dark:bg-[#181A1F] border ${
                          isDuplicateSlug ? "border-red-500 focus:border-red-500" : "border-slate-300 dark:border-gray-800 focus:border-[#0167D6]"
                        } rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none font-mono`}
                      />
                      {isDuplicateSlug && (
                        <p className="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1">
                          ⚠️ A service with this URL slug already exists. Please choose a unique slug.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      Display Order on /services
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.order}
                      onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>

                  {/* Card Thumbnail Image */}
                  <div className="p-4 bg-slate-50 dark:bg-[#181A1F]/60 border border-slate-200 dark:border-gray-800 rounded-[4px]">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Service Card Thumbnail / Icon
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-3">
                      This icon or illustration is displayed inside the service card on the client /services page.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-24 h-24 rounded-[4px] bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                        {form.image ? (
                          <img
                            src={form.image}
                            alt="Card icon preview"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400 dark:text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "image");
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={uploadingImage}
                            onClick={() => imageInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold transition shadow-sm"
                          >
                            {uploadingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UploadCloud className="w-4 h-4" />
                            )}
                            <span>{uploadingImage ? "Uploading..." : "Upload Card Image"}</span>
                          </button>

                          {form.image && (
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, image: "" })}
                              className="px-3 py-2 rounded-[4px] bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">
                        Short Description (Card Box Content)
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-gray-500">
                        {form.shortDesc.length} characters (approx 200–260 recommended)
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={form.shortDesc}
                      onChange={e => setForm({ ...form, shortDesc: e.target.value })}
                      placeholder="Enter the concise summary shown in the card box on /services..."
                      className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 leading-relaxed focus:outline-none focus:border-[#0167D6]"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">
                      Tip: Kept limited in height so all service cards on the main page remain uniform and aligned.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILS PAGE CUSTOMIZATION */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Hero Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      Details Page Hero Subtitle
                    </label>
                    <input
                      type="text"
                      value={form.bannerSubtitle}
                      onChange={e => setForm({ ...form, bannerSubtitle: e.target.value })}
                      placeholder="e.g. Custom, scalable, and high-performance digital platforms"
                      className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>

                  {/* Details Page Hero Cover Image */}
                  <div className="p-4 bg-slate-50 dark:bg-[#181A1F]/60 border border-slate-200 dark:border-gray-800 rounded-[4px]">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Details Page Main Cover / Hero Image
                    </label>
                    <p className="text-[11px] text-slate-600 dark:text-gray-400 mb-3">
                      High-resolution showcase image displayed above the detailed service narrative.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-36 h-20 rounded-[4px] bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                        {form.bannerImage ? (
                          <img
                            src={form.bannerImage}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          ref={bannerInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "banner");
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={uploadingBanner}
                            onClick={() => bannerInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-semibold transition"
                          >
                            {uploadingBanner ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UploadCloud className="w-4 h-4" />
                            )}
                            <span>{uploadingBanner ? "Uploading..." : "Upload Cover Image"}</span>
                          </button>

                          {form.bannerImage && (
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, bannerImage: "" })}
                              className="px-3 py-2 rounded-[4px] bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={form.bannerImage}
                          onChange={e => setForm({ ...form, bannerImage: e.target.value })}
                          placeholder="Or paste cover URL (e.g. /assets/web-CPDVLYNo.jpeg)"
                          className="w-full bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3 py-1.5 text-xs text-slate-900 dark:text-gray-300 focus:outline-none focus:border-[#0167D6]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WYSIWYG MS WORD RICH TEXT EDITOR FOR FULL DETAILS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-gray-300 mb-1.5">
                      Full Service Narrative & Details
                    </label>
                    <RichTextEditor
                      value={form.fullDesc}
                      onChange={val => setForm({ ...form, fullDesc: val })}
                      placeholder="Write your in-depth service overview, architecture breakdown, client benefits..."
                      minHeight="220px"
                    />
                  </div>

                  {/* WHY CHOOSE US REPEATER */}
                  <div className="p-4 bg-slate-50 dark:bg-[#181A1F]/50 border border-slate-200 dark:border-gray-800 rounded-[4px] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-[#0167D6] dark:text-[#3368B2]" />
                          Why Choose Us Checklist (Customizable)
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-gray-400">
                          Highlights rendered in the &quot;Why Choose Us?&quot; card on the details page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddWhyChoose}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-blue-50 dark:bg-[#3368B2]/20 hover:bg-blue-100 dark:hover:bg-[#3368B2]/40 text-[#0167D6] dark:text-[#3368B2] hover:text-blue-800 dark:hover:text-white text-xs font-semibold transition border border-blue-200 dark:border-[#3368B2]/40"
                      >
                        <Plus size={13} />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {form.whyChooseUs.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 bg-white dark:bg-[#131417] p-3 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs"
                        >
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={e => handleWhyChooseChange(idx, "title", e.target.value)}
                              placeholder="Title (e.g. Expert Team)"
                              className="w-full bg-slate-50 dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6] font-semibold"
                            />
                            <textarea
                              rows={2}
                              value={item.desc}
                              onChange={e => handleWhyChooseChange(idx, "desc", e.target.value)}
                              placeholder="Explanation of this benefit..."
                              className="w-full bg-slate-50 dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] p-2 text-xs text-slate-900 dark:text-gray-300 focus:outline-none focus:border-[#0167D6]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveWhyChoose(idx)}
                            className="p-1.5 text-gray-500 hover:text-red-400 rounded-[4px] hover:bg-white/5 transition"
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Features & Tech Stack */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                        Key Features / Deliverables (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={form.featuresText}
                        onChange={e => setForm({ ...form, featuresText: e.target.value })}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] p-3 text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-[#0167D6]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <TechnologyIconPicker
                        selected={form.techStack || []}
                        onChange={(newStack) =>
                          setForm(prev => ({
                            ...prev,
                            techStack: newStack,
                            techStackText: newStack.join(", ")
                          }))
                        }
                        label="Technology Frameworks & Tools"
                        helperText="Pick technology icons for this service. Displayed uniformly in the Technology Frameworks & Tools section."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING PACKAGES */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-gray-800">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Editable Pricing Packages & Feature Comparison
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
                        Build tiered pricing packages (Starter, Business, Enterprise) with customizable features for this service.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addPricingPlan}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white text-white-always text-xs font-bold transition shadow shrink-0"
                    >
                      <Plus size={14} />
                      <span>Add Another Pricing Plan</span>
                    </button>
                  </div>

                  {form.pricingPlans.length === 0 ? (
                    <div className="p-8 text-center border border-slate-200 dark:border-gray-800 rounded-[4px] bg-slate-50 dark:bg-[#0E0F12]">
                      <p className="text-xs text-slate-600 dark:text-gray-400">No pricing plans defined for this service yet.</p>
                      <button
                        type="button"
                        onClick={addPricingPlan}
                        className="mt-3 px-4 py-2 bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold rounded-[4px]"
                      >
                        Add Starter Pricing Plan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {form.pricingPlans.map((plan, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-[4px] border bg-slate-50 dark:bg-[#0E0F12] space-y-4 relative ${
                            plan.isPopular ? "border-[#0167D6] ring-1 ring-blue-500/30" : "border-slate-200 dark:border-gray-800"
                          }`}
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800/80">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0167D6] dark:bg-blue-900/40 dark:text-[#3368B2] font-bold text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                                {plan.name || `Plan #${idx + 1}`}
                              </h4>
                              {plan.isPopular && (
                                <span className="text-[10px] bg-blue-100 text-[#0167D6] dark:bg-blue-900/40 dark:text-blue-300 font-bold px-2 py-0.5 rounded-[4px]">
                                  Most Popular
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removePricingPlan(idx)}
                              className="text-slate-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded transition"
                              title="Delete this plan"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400">Plan Name</label>
                              <input
                                type="text"
                                value={plan.name}
                                placeholder="e.g. Starter Package"
                                onChange={(e) => updatePricingPlan(idx, "name", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400">Price (৳ BDT)</label>
                              <input
                                type="number"
                                value={plan.price}
                                placeholder="15000"
                                onChange={(e) => updatePricingPlan(idx, "price", Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400">Regular / Discount Price</label>
                              <input
                                type="number"
                                value={plan.discountPrice}
                                placeholder="20000"
                                onChange={(e) =>
                                  updatePricingPlan(idx, "discountPrice", Number(e.target.value) || 0)
                                }
                                className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400">Billing Cycle / Duration</label>
                              <input
                                type="text"
                                value={plan.period}
                                placeholder="e.g. One-Time Setup, / month"
                                onChange={(e) => updatePricingPlan(idx, "period", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                              />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400">Badge Text (Optional)</label>
                              <input
                                type="text"
                                value={plan.badge}
                                placeholder="e.g. Most Popular, Best Value"
                                onChange={(e) => updatePricingPlan(idx, "badge", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                              />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400">Short Description</label>
                              <input
                                type="text"
                                value={plan.description}
                                placeholder="e.g. Essential features tailored for startup tier."
                                onChange={(e) => updatePricingPlan(idx, "description", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                              />
                            </div>
                          </div>

                          {/* Features textarea */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-gray-400 flex items-center justify-between">
                              <span>Included Features (1 feature per line)</span>
                              <span className="text-[10px] text-slate-500 dark:text-gray-500">Will display as checkmarked items</span>
                            </label>
                            <textarea
                              rows={3}
                              value={plan.featuresText}
                              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                              onChange={(e) => updatePricingPlan(idx, "featuresText", e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={plan.isPopular}
                                onChange={(e) => updatePricingPlan(idx, "isPopular", e.target.checked)}
                                className="rounded border-slate-300 text-[#0167D6] focus:ring-0"
                              />
                              <span className="text-xs font-semibold">
                                Highlight this plan as "Most Popular" on sales cards
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  {activeTab === "card" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className="px-4 py-2 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-transparent text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Next: Details Page</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                  {activeTab === "details" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("card")}
                        className="px-4 py-2 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-transparent text-xs font-semibold transition"
                      >
                        Back to Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("pricing")}
                        className="px-4 py-2 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-transparent text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <span>Next: Pricing Packages</span>
                        <ArrowRight size={14} />
                      </button>
                    </>
                  )}
                  {activeTab === "pricing" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className="px-4 py-2 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-transparent text-xs font-semibold transition"
                    >
                      Back to Details Page
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-transparent text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-lg shadow-blue-500/20 transition"
                  >
                    {editItem ? "Save Service Changes" : "Create Service"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
