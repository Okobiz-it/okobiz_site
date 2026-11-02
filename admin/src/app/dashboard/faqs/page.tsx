"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, HelpCircle, X } from "lucide-react";

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "General",
    order: 1,
  });

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      if (data.success) setFaqs(data.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      question: "",
      answer: "",
      category: "General",
      order: faqs.length + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (f: any) => {
    setEditItem(f);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category || "General",
      order: f.order || 1,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      await fetch("/api/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editItem._id, ...form }),
      });
    } else {
      await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    fetchFaqs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    await fetch(`/api/faqs?id=${id}`, { method: "DELETE" });
    fetchFaqs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <HelpCircle className="text-[#3368B2]" size={24} />
            Frequently Asked Questions (FAQs)
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Manage the accordion questions and answers on the homepage FAQ section
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">Loading FAQs...</div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className="bg-[#131417] border border-gray-800 rounded-2xl p-5 flex items-start justify-between gap-4 group hover:border-gray-700 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-900/20 text-[#3368B2] border border-blue-800/30 uppercase">
                    {faq.category}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">Order #{faq.order}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{faq.question}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{faq.answer}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEdit(faq)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(faq._id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131417] border border-gray-800 rounded-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">
              {editItem ? "Edit FAQ" : "Add New FAQ"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  className="w-full bg-[#181A1F] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={form.answer}
                  onChange={e => setForm({ ...form, answer: e.target.value })}
                  className="w-full bg-[#181A1F] border border-gray-800 rounded-xl p-3 text-xs text-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full bg-[#181A1F] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

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
                  className="px-5 py-2 rounded-xl bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold"
                >
                  {editItem ? "Save Changes" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
