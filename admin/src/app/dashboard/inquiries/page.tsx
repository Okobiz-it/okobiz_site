"use client";
import React, { useEffect, useState } from "react";
import { MessageSquare, Trash2, Mail, Phone, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      if (data.success) setInquiries(data.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/inquiries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, status }),
    });
    fetchInquiries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer inquiry?")) return;
    await fetch(`/api/inquiries?id=${id}`, { method: "DELETE" });
    if (selectedInquiry && selectedInquiry._id === id) setSelectedInquiry(null);
    fetchInquiries();
  };

  const filtered = inquiries.filter(i => filter === "all" || i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="text-[#0167D6]" size={24} />
            Customer Leads & Inquiries
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs mt-1">
            Review contact form submissions, WhatsApp lead inquiries, and project proposals
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-gray-800 pb-3">
        {(["all", "new", "in_progress", "resolved"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition ${
              filter === f
                ? "bg-[#0167D6] text-white text-white-always shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white border border-slate-200 dark:border-transparent"
            }`}
          >
            {f === "all" ? "All Leads" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-gray-500 text-xs">Loading inquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] p-8 shadow-sm">
          <MessageSquare size={48} className="mx-auto text-slate-400 dark:text-gray-600 mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No inquiries found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#181A1F] text-slate-600 dark:text-gray-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
                {filtered.map(inq => (
                  <tr key={inq._id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{inq.name}</span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-slate-700 dark:text-gray-300 flex items-center gap-1.5"><Mail size={12} className="text-[#0167D6]" /> {inq.email}</div>
                      {inq.phone && <div className="text-slate-500 dark:text-gray-400 flex items-center gap-1.5"><Phone size={12} className="text-emerald-500" /> {inq.phone}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-gray-300">
                      {inq.service || "General"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-gray-400 text-[11px]">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={inq.status}
                        onChange={e => handleStatusChange(inq._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase border focus:outline-none bg-white dark:bg-[#181A1F] ${
                          inq.status === 'new' ? 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-[#181A1F]' :
                          inq.status === 'in_progress' ? 'text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-[#181A1F]' :
                          'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-[#181A1F]'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="px-2.5 py-1 rounded-[4px] bg-blue-50 hover:bg-[#0167D6] text-[#0167D6] hover:text-white dark:bg-[#3368B2]/20 dark:hover:bg-[#3368B2] dark:text-[#3368B2] dark:hover:text-white font-semibold transition border border-blue-200 dark:border-transparent"
                      >
                        Read Message
                      </button>
                      <button
                        onClick={() => handleDelete(inq._id)}
                        className="p-1.5 rounded-[4px] bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] w-full max-w-lg p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Inquiry from {selectedInquiry.name}</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>

            <div className="space-y-3 bg-slate-50 dark:bg-[#181A1F] p-4 rounded-[4px] border border-slate-200 dark:border-gray-800 text-xs mb-4">
              <div><strong className="text-slate-600 dark:text-gray-400">Email:</strong> <a href={`mailto:${selectedInquiry.email}`} className="text-[#0167D6] font-semibold">{selectedInquiry.email}</a></div>
              {selectedInquiry.phone && <div><strong className="text-slate-600 dark:text-gray-400">Phone:</strong> <a href={`tel:${selectedInquiry.phone}`} className="text-slate-900 dark:text-white font-semibold">{selectedInquiry.phone}</a></div>}
              <div><strong className="text-slate-600 dark:text-gray-400">Service:</strong> <span className="text-slate-900 dark:text-white font-semibold">{selectedInquiry.service}</span></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Message Body:</label>
              <div className="bg-slate-50 dark:bg-[#0E0F12] p-4 rounded-[4px] border border-slate-200 dark:border-gray-800 text-xs text-slate-800 dark:text-gray-200 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-gray-800">
              <a
                href={`mailto:${selectedInquiry.email}`}
                className="px-4 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20"
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
