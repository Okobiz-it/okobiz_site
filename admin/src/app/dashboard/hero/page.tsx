"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Sliders, Check, X, Image as ImageIcon, ArrowRight, UploadCloud } from "lucide-react";

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    img: "",
    buttonText: "More Information",
    buttonLink: "/contact-us",
    order: 1,
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);

  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/hero");
      const data = await res.json();
      if (data.success) setSlides(data.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: "",
      img: "/assets/Untitled-10-C-7O9vGO.webp",
      buttonText: "More Information",
      buttonLink: "/contact-us",
      order: slides.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (slide: any) => {
    setEditItem(slide);
    setForm({
      title: slide.title,
      img: slide.img,
      buttonText: slide.buttonText || "More Information",
      buttonLink: slide.buttonLink || "/contact-us",
      order: slide.order || 1,
      isActive: slide.isActive !== undefined ? slide.isActive : true,
    });
    setModalOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds the maximum upload limit of 5MB.");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setForm(f => ({ ...f, img: data.url }));
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {} finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editItem._id, ...form }),
      });
    } else {
      await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    fetchSlides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    await fetch(`/api/hero?id=${id}`, { method: "DELETE" });
    fetchSlides();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sliders className="text-[#0167D6] dark:text-[#3368B2]" size={24} />
            Hero Carousel Slides
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs mt-1">
            Manage the titles, background media, and CTA buttons on the client homepage hero slider
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold shadow-md transition cursor-pointer"
        >
          <Plus size={16} /> Add Hero Slide
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 dark:text-gray-500 text-xs">Loading slides...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {slides.map((slide, i) => (
            <div
              key={slide._id || i}
              className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
            >
              {/* Slide preview image */}
              <div className="relative h-48 bg-black overflow-hidden">
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none"></div>
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  <span className="px-2.5 py-1 rounded-[4px] bg-[#0167D6] text-white text-white-always text-[11px] font-bold shadow-md">
                    Order #{slide.order}
                  </span>
                  <span className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold text-white text-white-always shadow-md ${
                    slide.isActive ? 'bg-emerald-600' : 'bg-red-600'
                  }`}>
                    {slide.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <h3 className="text-white text-white-always font-bold text-sm leading-snug line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {slide.title}
                  </h3>
                </div>
              </div>

              {/* Slide metadata & actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4 bg-white dark:bg-[#131417]">
                <div className="text-xs text-slate-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>CTA Button:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{slide.buttonText}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Link:</span>
                    <span className="text-[#0167D6] dark:text-[#3368B2] font-semibold truncate max-w-[150px]">{slide.buttonLink}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-gray-800/80">
                  <button
                    onClick={() => openEdit(slide)}
                    className="p-2 rounded-[4px] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent transition"
                    title="Edit Slide"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    className="p-2 rounded-[4px] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-transparent transition"
                    title="Delete Slide"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editItem ? "Edit Hero Slide" : "Add New Hero Slide"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Slide Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Drive Business, Elevate Success"
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">Background Slide Image *</label>
                <div className="space-y-2">
                  <label className="cursor-pointer w-full py-2.5 px-3 bg-[#0167D6] hover:bg-blue-600 text-white text-white-always rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition">
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UploadCloud size={15} />
                        <span>{form.img ? "Change Slide Image" : "Upload Slide Image"}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                  {form.img && (
                    <div className="h-28 w-full rounded-[4px] overflow-hidden bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-gray-800 relative group">
                      <img src={form.img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, img: "" })}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded text-[10px] opacity-0 group-hover:opacity-100 transition shadow"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={e => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={form.buttonLink}
                    onChange={e => setForm({ ...form, buttonLink: e.target.value })}
                    className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0167D6] focus:ring-0 bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-gray-300 cursor-pointer">
                    Visible on live site
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-transparent text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold transition shadow-sm"
                >
                  {editItem ? "Save Changes" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
