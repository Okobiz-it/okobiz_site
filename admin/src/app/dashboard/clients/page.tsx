"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Users, Search, ExternalLink, ImageIcon, X, UploadCloud } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    image: "",
    websiteLink: "",
    order: 1,
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (data.success) setClients(data.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      name: "",
      image: "/assets/nitol niloy-C3PFPoNU.png",
      websiteLink: "",
      order: clients.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditItem(c);
    setForm({
      name: c.name,
      image: c.image,
      websiteLink: c.websiteLink || "",
      order: c.order || 1,
      isActive: c.isActive !== undefined ? c.isActive : true,
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
        setForm(f => ({ ...f, image: data.url }));
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
      await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editItem._id, ...form }),
      });
    } else {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this client partner?")) return;
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    fetchClients();
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="text-[#3368B2]" size={24} />
            Client Partners
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Manage the client partner logos featured in the homepage auto-slider and /ourclients catalog
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition"
        >
          <Plus size={16} /> Add Partner
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search client partners..."
          className="w-full bg-[#131417] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
        />
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">Loading partners...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((client, i) => (
            <div
              key={client._id || i}
              className="bg-[#131417] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-between hover:border-gray-700 transition group relative"
            >
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center p-3 shadow-md my-2">
                <img
                  src={client.image}
                  alt={client.name}
                  className="max-h-12 max-w-[80px] object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="text-center w-full mt-2">
                <h3 className="text-xs font-bold text-white truncate">{client.name}</h3>
                {client.websiteLink && (
                  <a
                    href={client.websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#3368B2] hover:underline flex items-center justify-center gap-1 mt-0.5"
                  >
                    <span>Website</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-gray-800/80 w-full justify-center">
                <button
                  onClick={() => openEdit(client)}
                  className="p-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white border border-slate-200 dark:border-transparent transition"
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(client._id)}
                  className="p-1.5 rounded-[4px] bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client Partner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editItem ? "Edit Client Partner" : "Add Client Partner"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Partner / Brand Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Nitol Niloy"
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">Client Logo Image *</label>
                <div className="space-y-2">
                  <label className="cursor-pointer w-full py-2.5 px-3 bg-[#0167D6] hover:bg-blue-600 text-white text-white-always rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition">
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UploadCloud size={15} />
                        <span>{form.image ? "Change Client Logo" : "Upload Client Logo"}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                  {form.image && (
                    <div className="relative group w-24 h-24 mx-auto rounded-[4px] bg-white border border-slate-200 dark:border-gray-800 flex items-center justify-center p-3 shadow-xs">
                      <img src={form.image} alt="Preview" className="max-h-16 max-w-[70px] object-contain" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded text-[10px] opacity-0 group-hover:opacity-100 transition shadow"
                        title="Remove logo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  value={form.websiteLink}
                  onChange={e => setForm({ ...form, websiteLink: e.target.value })}
                  placeholder="https://clientwebsite.com"
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Order</label>
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
                    id="clientActive"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0167D6] focus:ring-0 border-slate-300"
                  />
                  <label htmlFor="clientActive" className="text-xs font-semibold text-slate-700 dark:text-gray-300 cursor-pointer">
                    Active Partner
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
                  className="px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition"
                >
                  {editItem ? "Save Changes" : "Add Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
