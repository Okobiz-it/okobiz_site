"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, Search, ImageIcon, X, Calendar, User } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { createSlug } from "@/lib/slug";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Web Development",
    author: "Md. Sorower Jahan",
    photo: "/assets/website-app-DOXr3sR7.webp",
    content: "",
    isPublished: true,
  });
  const [uploading, setUploading] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (data.success) setBlogs(data.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: "",
      slug: "",
      category: "Web Development",
      author: "Md. Sorower Jahan",
      photo: "/assets/website-app-DOXr3sR7.webp",
      content: "",
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditItem(b);
    setForm({
      title: b.title,
      slug: b.slug || createSlug(b.title),
      category: b.category,
      author: b.author,
      photo: b.photo,
      content: b.content,
      isPublished: b.isPublished !== undefined ? b.isPublished : true,
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
        setForm(f => ({ ...f, photo: data.url }));
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
      await fetch("/api/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editItem._id, ...form }),
      });
    } else {
      await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    fetchBlogs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    await fetch(`/api/blogs?id=${id}`, { method: "DELETE" });
    fetchBlogs();
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="text-[#3368B2]" size={24} />
            Blog Posts & Insights
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Publish thought leadership articles, SEO content, and industry news for okobiz clients
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition"
        >
          <Plus size={16} /> New Article
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or category..."
          className="w-full bg-[#131417] border border-gray-800 rounded-[4px] pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
        />
      </div>

      {/* Blog Cards */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">Loading blog posts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((blog) => (
            <div
              key={blog._id}
              className="bg-[#131417] border border-gray-800 rounded-[4px] overflow-hidden shadow-xl flex flex-col group"
            >
              <div className="relative h-44 bg-black overflow-hidden">
                <img
                  src={blog.photo}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-[4px] bg-[#3368B2] text-white text-[11px] font-bold">
                  {blog.category}
                </span>
                <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                  blog.isPublished ? 'bg-emerald-500/80 text-white' : 'bg-gray-500/80 text-white'
                }`}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#3368B2] transition line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>
                  <div
                    className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blog.content.replace(/<[^>]+>/g, ' ') }}
                  />
                </div>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><User size={12} /> {blog.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(blog)}
                      className="p-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white border border-slate-200 dark:border-transparent transition"
                      title="Edit Post"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-1.5 rounded-[4px] bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
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

      {/* Blog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] w-full max-w-4xl p-6 relative max-h-[92vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editItem ? "Edit Blog Article" : "Write New Blog Article"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">Article Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => {
                    const newTitle = e.target.value;
                    setForm(f => ({
                      ...f,
                      title: newTitle,
                      slug: createSlug(newTitle)
                    }));
                  }}
                  placeholder="e.g. Modern UI/UX Trends for Web Applications"
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-[#0167D6] font-mono">/blogs/{form.slug || "..."}</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: createSlug(e.target.value) })}
                  placeholder="modern-ui-ux-trends-for-web-applications"
                  className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Graphics Solution">Graphics Solution</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">Author Name</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                    className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
                  />
                </div>
              </div>

              {/* Cover Image Upload (No URL input field) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">Cover Image</label>
                <div className="flex items-center gap-2 mb-3">
                  <label className="cursor-pointer px-4 py-2 bg-[#0167D6] hover:bg-blue-600 text-white text-white-always rounded-[4px] text-xs font-bold inline-flex items-center justify-center gap-2 transition shadow-sm">
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ImageIcon size={15} />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload Cover Image"}</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                  {form.photo && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, photo: "" }))}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white dark:border-transparent rounded-[4px] text-xs transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {form.photo && (
                  <div className="h-44 w-full rounded-[4px] overflow-hidden bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-gray-800 relative">
                    <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Large Article Content with RichTextEditor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">Article Content</label>
                <RichTextEditor
                  value={form.content}
                  onChange={val => setForm({ ...form, content: val })}
                  placeholder="Write your article content with headings, bullet lists, formatting, blockquotes, and links..."
                  minHeight="350px"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.isPublished}
                  onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0167D6] border-slate-300 focus:ring-0"
                />
                <label htmlFor="published" className="text-xs font-semibold text-slate-700 dark:text-gray-300 cursor-pointer">
                  Publish article live
                </label>
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
                  className="px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold transition shadow-lg shadow-blue-500/20"
                >
                  {editItem ? "Save Changes" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
