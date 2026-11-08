"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, UserCheck, Search, ImageIcon, X, Shield } from "lucide-react";

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "team" | "advisor">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    designation: "",
    image: "",
    type: "team" as "team" | "advisor",
    order: 1,
  });
  const [uploading, setUploading] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (data.success) setTeam(data.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      name: "",
      designation: "",
      image: "/assets/CEO-0fmQDjG-.webp",
      type: "team",
      order: team.length + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (m: any) => {
    setEditItem(m);
    setForm({
      name: m.name,
      designation: m.designation,
      image: m.image,
      type: m.type || "team",
      order: m.order || 1,
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
      await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editItem._id, ...form }),
      });
    } else {
      await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    fetchTeam();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    await fetch(`/api/team?id=${id}`, { method: "DELETE" });
    fetchTeam();
  };

  const filtered = team.filter(m => tab === "all" || m.type === tab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="text-[#0167D6] dark:text-[#3368B2]" size={24} />
            Team Members & Advisors
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Manage company leadership, executive engineers, digital marketers, and legal advisors
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-gray-800 pb-3">
        {(["all", "team", "advisor"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition ${
              tab === t
                ? "bg-[#0167D6] text-white text-white-always shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 border border-slate-200 dark:border-transparent"
            }`}
          >
            {t === "all" ? "All Roster" : t === "team" ? "Core Team" : "Legal Advisors"}
          </button>
        ))}
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-gray-500 text-xs">Loading roster...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filtered.map((member) => (
            <div
              key={member._id}
              className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] p-4 flex flex-col items-center justify-between text-center group hover:border-[#0167D6] dark:hover:border-gray-700 shadow-xs hover:shadow-md transition"
            >
              {/* Photo Frame - 20% Bigger, Crisp Pure White Background in Light Mode */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white dark:bg-[#181A1F] border-2 border-slate-200 dark:border-[#3368B2]/40 shadow-sm my-2 relative shrink-0">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>

              <div className="mt-2 w-full">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={member.name}>{member.name}</h3>
                <p className="text-[11px] text-[#0167D6] dark:text-[#3368B2] font-semibold truncate mt-0.5">{member.designation}</p>
                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  member.type === 'advisor'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-transparent'
                    : 'bg-blue-50 text-[#0167D6] dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-transparent'
                }`}>
                  {member.type === 'advisor' ? 'Legal Advisor' : 'Team'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-gray-800/80 w-full justify-center">
                <button
                  onClick={() => openEdit(member)}
                  className="p-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white border border-slate-200 dark:border-transparent transition"
                  title="Edit Member"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(member._id)}
                  className="p-1.5 rounded-[4px] bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                  title="Delete Member"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Modal */}
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
              {editItem ? "Edit Team Member" : "Add Team Member"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Md. Sorower Jahan"
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Designation / Role</label>
                <input
                  type="text"
                  required
                  value={form.designation}
                  onChange={e => setForm({ ...form, designation: e.target.value })}
                  placeholder="e.g. CEO, Sr. Software Engineer"
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Member Category</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as any })}
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                >
                  <option value="team">Core Team Member</option>
                  <option value="advisor">Legal Advisor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Profile Photo</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="flex-1 bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  />
                  <label className="cursor-pointer px-3.5 py-2 bg-[#0167D6] hover:bg-blue-600 text-white text-white-always rounded-[4px] text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 min-w-[85px] h-[34px] shadow-sm transition">
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ImageIcon size={14} />
                        <span>Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                </div>
                {form.image && (
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-white dark:bg-[#181A1F] border-2 border-slate-200 dark:border-gray-800 shadow-sm">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
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
                  {editItem ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
