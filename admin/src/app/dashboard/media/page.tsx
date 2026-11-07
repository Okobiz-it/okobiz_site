"use client";
import React, { useEffect, useState } from "react";
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Check,
  FileText,
  Video,
  Image as ImageIcon,
  ExternalLink,
  UploadCloud,
  X,
  Play
} from "lucide-react";

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "image" | "pdf" | "video">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [videoUrlForm, setVideoUrlForm] = useState({ name: "", url: "", type: "video" as "video" | "pdf" | "image" });

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.success) setMedia(data.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg|avi|mkv)$/i.test(file.name);
      const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name);

      if (isVideo && file.size > 200 * 1024 * 1024) {
        alert(`Video "${file.name}" exceeds the maximum upload limit of 200MB.`);
        continue;
      }
      if (isImage && file.size > 5 * 1024 * 1024) {
        alert(`Image "${file.name}" exceeds the maximum upload limit of 5MB.`);
        continue;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name);
      try {
        await fetch("/api/upload", { method: "POST", body: fd });
      } catch (err) {}
    }
    setUploading(false);
    fetchMedia();
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlForm.url) return;
    await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: videoUrlForm.name || "External Media",
        url: videoUrlForm.url,
        type: videoUrlForm.type,
      }),
    });
    setUrlModalOpen(false);
    setVideoUrlForm({ name: "", url: "", type: "video" });
    fetchMedia();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    fetchMedia();
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = media.filter(m => tab === "all" || m.type === tab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FolderOpen className="text-[#0167D6]" size={24} />
            Multimedia Asset Library
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs mt-1">
            Central repository for all client images, company PDF brochures, and demo video reels
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition min-w-[120px] h-[38px]">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UploadCloud size={16} />
                <span>Upload Images / PDFs / Videos</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*,.pdf,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setUrlModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-bold border border-slate-300 dark:border-white/10 transition"
          >
            <Video size={16} /> Add Video / URL
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-gray-800 pb-3">
        {(["all", "image", "pdf", "video"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition ${
              tab === t
                ? "bg-[#0167D6] text-white text-white-always shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 border border-slate-200 dark:border-transparent"
            }`}
          >
            {t === "all" ? "All Media" : t === "image" ? "Images" : t === "pdf" ? "PDF Documents" : "Videos"}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-gray-500 text-xs">Loading media assets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] p-8 shadow-sm">
          <FolderOpen size={48} className="mx-auto text-slate-400 dark:text-gray-600 mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No media files found</p>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Upload images, brochures, or video links above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between group hover:border-[#0167D6] dark:hover:border-gray-700 transition"
            >
              {/* Media Preview Box - Crisp pure white in light mode, deep cinema in dark mode */}
              <div className="h-32 bg-slate-50 dark:bg-[#0E0F12] border-b border-slate-200 dark:border-gray-800/80 flex items-center justify-center relative overflow-hidden">
                {item.type === "image" ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-contain p-2" />
                ) : item.type === "pdf" ? (
                  <div className="flex flex-col items-center justify-center text-rose-500 dark:text-rose-400 gap-1.5">
                    <FileText size={38} />
                    <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-gray-300">PDF Document</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#0167D6] dark:text-cyan-400 gap-1.5">
                    <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-cyan-500/20 flex items-center justify-center text-[#0167D6] dark:text-cyan-400">
                      <Play size={22} fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-gray-300">Video Media</span>
                  </div>
                )}

                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[4px] bg-slate-900/85 dark:bg-black/80 backdrop-blur-md text-white text-white-always text-[9px] font-bold uppercase shadow">
                  {item.type}
                </span>
              </div>

              {/* Details & Actions */}
              <div className="p-3 flex-1 flex flex-col justify-between bg-white dark:bg-[#131417]">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.name}>{item.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 truncate mt-0.5">
                    {item.size ? `${(item.size / 1024).toFixed(0)} KB` : item.mimeType || "Link"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-3 mt-2 border-t border-slate-100 dark:border-gray-800/80">
                  <button
                    onClick={() => handleCopy(item.url, item._id)}
                    className="flex-1 py-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-center gap-1 transition"
                    title="Copy Public URL"
                  >
                    {copiedId === item._id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedId === item._id ? "Copied!" : "Copy URL"}</span>
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white border border-slate-200 dark:border-transparent transition"
                    title="Open / Download"
                  >
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-[4px] bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL Embed Modal */}
      {urlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setUrlModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Media by URL</h2>

            <form onSubmit={handleAddUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={videoUrlForm.name}
                  onChange={e => setVideoUrlForm({ ...videoUrlForm, name: e.target.value })}
                  placeholder="e.g. Corporate 3D Reel"
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Media Type</label>
                <select
                  value={videoUrlForm.type}
                  onChange={e => setVideoUrlForm({ ...videoUrlForm, type: e.target.value as any })}
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                >
                  <option value="video">Video (YouTube, Vimeo, MP4)</option>
                  <option value="pdf">PDF Document URL</option>
                  <option value="image">Image URL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Direct URL</label>
                <input
                  type="url"
                  required
                  value={videoUrlForm.url}
                  onChange={e => setVideoUrlForm({ ...videoUrlForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setUrlModalOpen(false)}
                  className="px-4 py-2 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-transparent text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
