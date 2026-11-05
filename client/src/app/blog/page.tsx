"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import { BlogItem } from "@/data/mockData";
import { getBlogs } from "@/lib/api";
import { cleanSnippet } from "@/lib/richText";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Fetch live blogs from admin/MongoDB
  useEffect(() => {
    const fetchLiveBlogs = async () => {
      try {
        const liveBlogs = await getBlogs();
        if (Array.isArray(liveBlogs) && liveBlogs.length > 0) {
          setBlogs(liveBlogs);
        }
      } catch (e) {
        console.warn("Failed to fetch live blogs:", e);
      }
    };
    fetchLiveBlogs();
  }, []);


  const categories = [
    "All",
    "Web Development",
    "Digital Marketing",
    "Graphics Solution",
  ];

  // Reset to page 1 on category filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat]);

  const filteredBlogs = useMemo(() => {
    return selectedCat === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCat);
  }, [blogs, selectedCat]);

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBlogs.slice(start, start + itemsPerPage);
  }, [filteredBlogs, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <PageBanner
        title="Our News & Insights"
        subtitle="Articles, technical updates, and digital marketing insights from our team"
      />

      <section className="py-20 bg-[#0E100F]" ref={gridTopRef}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span
              className="font-bold px-5 py-2 mb-3 inline-block text-[#0167D6] rounded-[4px] text-xs uppercase tracking-wider"
              style={{ background: "rgba(1, 103, 214, 0.15)" }}
            >
              - Our News -
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-2 mb-4">
              Learn Something From Our Blog
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Discover tips on web architecture, SEO optimization, and digital brand elevation.
            </p>
          </div>

          {/* Categories bar */}
          <div className="flex justify-center flex-wrap gap-2 mb-14">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`text-xs font-semibold px-5 py-2.5 rounded-[4px] transition-all duration-200 ${
                  selectedCat === cat
                    ? "bg-[#3368B2] text-white shadow-lg shadow-blue-900/40"
                    : "bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedBlogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-[#181A1D] border border-gray-800 rounded-[4px] overflow-hidden hover:border-[#3368B2] transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <Link href={`/blogs/${blog.slug || blog._id}`} className="block h-52 overflow-hidden bg-gray-900">
                    <img
                      src={blog.photo}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="bg-[#3368B2]/20 text-[#0167D6] font-bold px-2.5 py-0.5 rounded-[4px]">
                        {blog.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link href={`/blogs/${blog.slug || blog._id}`}>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#0167D6] transition-colors line-clamp-2 mb-3 min-h-[3.25rem]">
                        {blog.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed min-h-[3rem] overflow-hidden text-ellipsis">
                      {cleanSnippet(blog.content, 180)}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-gray-800/80 mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#3368B2]" />
                    {blog.author}
                  </span>

                  <Link
                    href={`/blogs/${blog.slug || blog._id}`}
                    className="text-xs font-bold text-[#0167D6] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* 9 items per page Pagination Bar */}
          {totalPages > 1 && (
            <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                Showing <span className="text-white font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span>–<span className="text-white font-semibold">{Math.min(currentPage * itemsPerPage, filteredBlogs.length)}</span> of <span className="text-white font-semibold">{filteredBlogs.length}</span> articles (9 per page)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-[4px] bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:border-[#3368B2] disabled:opacity-30 disabled:pointer-events-none transition"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-[4px] text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-[#3368B2] text-white shadow-lg shadow-blue-900/40"
                        : "bg-[#181A1D] border border-gray-800 text-gray-300 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-[4px] bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:border-[#3368B2] disabled:opacity-30 disabled:pointer-events-none transition"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <TalkCta />
    </div>
  );
}

