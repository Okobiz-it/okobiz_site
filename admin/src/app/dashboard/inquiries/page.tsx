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
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <MessageSquare className="text-[#3368B2]" size={24} />
            Customer Leads & Inquiries
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Review contact form submissions, WhatsApp lead inquiries, and project proposals
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3">
        {(["all", "new", "in_progress", "resolved"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              filter === f
                ? "bg-[#3368B2] text-white"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {f === "all" ? "All Leads" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">Loading inquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#131417] border border-gray-800 rounded-2xl p-8">
          <MessageSquare size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-sm font-bold text-white">No inquiries found</p>
        </div>
      ) : (
        <div className="bg-[#131417] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181A1F] text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {filtered.map(inq => (
                  <tr key={inq._id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{inq.name}</span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-gray-300 flex items-center gap-1.5"><Mail size={12} className="text-[#3368B2]" /> {inq.email}</div>
                      {inq.phone && <div className="text-gray-400 flex items-center gap-1.5"><Phone size={12} className="text-emerald-400" /> {inq.phone}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-300">
                      {inq.service || "General"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={inq.status}
                        onChange={e => handleStatusChange(inq._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border focus:outline-none bg-[#181A1F] ${
                          inq.status === 'new' ? 'text-amber-400 border-amber-500/30' :
                          inq.status === 'in_progress' ? 'text-blue-400 border-blue-500/30' :
                          'text-emerald-400 border-emerald-500/30'
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
                        className="px-2.5 py-1 rounded-lg bg-[#3368B2]/20 hover:bg-[#3368B2] text-[#3368B2] hover:text-white font-semibold transition"
                      >
                        Read Message
                      </button>
                      <button
                        onClick={() => handleDelete(inq._id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131417] border border-gray-800 rounded-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-white mb-1">Inquiry from {selectedInquiry.name}</h2>
            <p className="text-xs text-gray-400 mb-4">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>

            <div className="space-y-3 bg-[#181A1F] p-4 rounded-xl border border-gray-800 text-xs mb-4">
              <div><strong className="text-gray-400">Email:</strong> <a href={`mailto:${selectedInquiry.email}`} className="text-[#3368B2] font-semibold">{selectedInquiry.email}</a></div>
              {selectedInquiry.phone && <div><strong className="text-gray-400">Phone:</strong> <a href={`tel:${selectedInquiry.phone}`} className="text-white font-semibold">{selectedInquiry.phone}</a></div>}
              <div><strong className="text-gray-400">Service:</strong> <span className="text-white">{selectedInquiry.service}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Message Body:</label>
              <div className="bg-black/40 p-4 rounded-xl border border-gray-800 text-xs text-gray-200 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-800">
              <a
                href={`mailto:${selectedInquiry.email}`}
                className="px-4 py-2 rounded-xl bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold"
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
