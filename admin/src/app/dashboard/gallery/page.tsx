"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, ImageIcon, X, Image as PhotoIcon, Check } from "lucide-react";

export default function GalleryAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Events",
    imageUrl: "",
    description: "",
    order: 0,
    featured: false,
  });

  const categories = [
    "Events",
    "Office Life",
    "Projects",
    "Team Moments",
    "Achievements"
  ];

  const fetchGallery = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: "",
      category: "Events",
      imageUrl: "",
      description: "",
      order: items.length + 1,
      featured: false,
    });
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      title: item.title,
      category: item.category || "Events",
      imageUrl: item.imageUrl,
      description: item.description || "",
      order: item.order || 0,
      featured: Boolean(item.featured),
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
        setForm((f) => ({ ...f, imageUrl: data.url }));
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      alert("Please upload or provide an image URL");
      return;
    }

    if (editItem) {
      await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editItem._id, ...form }),
      });
    } else {
      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setModalOpen(false);
    fetchGallery();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery photo?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    fetchGallery();
  };

  const filtered = items.filter((it) => {
    const matchSearch =
      it.title?.toLowerCase().includes(search.toLowerCase()) ||
      it.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || it.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <PhotoIcon className="text-[#3368B2]" size={24} />
            Photo Gallery Management
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Upload company event photos, culture snapshots, project achievements, and team memories
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition"
        >
          <Plus size={16} /> Upload Photo
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by caption or category..."
            className="w-full bg-[#131417] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                categoryFilter === cat
                  ? "bg-[#3368B2] text-white font-bold"
                  : "bg-[#131417] text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">Loading gallery photos...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#131417] border border-gray-800 rounded-2xl">
          <p className="text-gray-400 text-sm">No photos found. Click "Upload Photo" to add one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-[#131417] border border-gray-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-[#3368B2] transition duration-200"
            >
              <div className="relative h-48 bg-black overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-[#3368B2] text-white text-[10px] font-bold">
                  {item.category}
                </span>
                {item.featured && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-bold">
                    Featured
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#3368B2] transition">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-[11px] text-gray-500">Order: {item.order}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#131417] border border-gray-800 rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <PhotoIcon className="text-[#3368B2]" size={18} />
              {editItem ? "Edit Gallery Photo" : "Upload New Gallery Photo"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Photo Title / Caption *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Tech Summit 2024"
                  className="w-full bg-[#181A1F] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3368B2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Image File / URL *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="/assets/image.png or uploaded path"
                    className="flex-1 bg-[#181A1F] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <label className="cursor-pointer px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 min-w-[100px] h-[34px]">
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ImageIcon size={14} />
                        <span>Upload File</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                </div>
                {form.imageUrl && (
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-black/50 border border-gray-800 relative">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Additional context about this event, team activity, or milestone..."
                  className="w-full bg-[#181A1F] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#3368B2] bg-gray-800 border-gray-700"
                />
                <label htmlFor="featured" className="text-xs font-semibold text-gray-300 cursor-pointer">
                  Feature on Gallery Highlights
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-900/30"
                >
                  {editItem ? "Save Changes" : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
