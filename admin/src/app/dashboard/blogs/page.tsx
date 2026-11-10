"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, BookOpen, Search, User } from "lucide-react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBlogs(data.data);
      }
    } catch (e) {
      console.warn("Failed to fetch blogs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await fetch(`/api/blogs?id=${id}`, { method: "DELETE" });
      fetchBlogs();
    } catch (e) {
      alert("Failed to delete post");
    }
  };

  const filtered = blogs.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="text-[#3368B2]" size={24} />
            Blog Posts &amp; Insights
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Publish thought leadership articles, SEO content, and industry news for okobiz clients
          </p>
        </div>
        <Link
          href="/dashboard/blogs/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition cursor-pointer"
        >
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or category..."
          className="w-full bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-800 rounded-[4px] pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
        />
      </div>

      {/* Blog Cards */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-gray-400 text-xs">
          Loading blog posts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] p-12 text-center text-slate-500 dark:text-gray-400 text-sm">
          <BookOpen className="w-12 h-12 text-slate-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 dark:text-white">No articles found</p>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 mb-5">
            Start publishing your first editorial blog post
          </p>
          <Link
            href="/dashboard/blogs/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] bg-[#3368B2] text-white text-xs font-bold"
          >
            <Plus size={14} /> Write Article
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filtered.map((blog) => (
            <div
              key={blog._id}
              className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100 dark:bg-black overflow-hidden">
                  <img
                    src={blog.photo || "/assets/website-app-DOXr3sR7.webp"}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e: any) => {
                      e.target.src = "/assets/website-app-DOXr3sR7.webp";
                    }}
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-[4px] bg-[#3368B2] text-white text-[11px] font-bold shadow">
                    {blog.category}
                  </span>
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-[4px] text-[10px] font-bold shadow ${
                      blog.isPublished ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"
                    }`}
                  >
                    {blog.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#3368B2] transition line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>
                  <div
                    className="text-xs text-slate-500 dark:text-gray-400 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: (blog.content || "").replace(/<[^>]+>/g, " "),
                    }}
                  />
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-200 dark:border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-400 truncate max-w-[170px]">
                    <User size={12} />
                    <span className="truncate">{blog.author || "okobiz Editorial"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/blogs/${blog._id}/edit`}
                      className="p-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white border border-slate-200 dark:border-transparent transition inline-flex items-center justify-center"
                      title="Edit Post"
                    >
                      <Edit2 size={13} />
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-1.5 rounded-[4px] bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer"
                      title="Delete Post"
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
    </div>
  );
}
