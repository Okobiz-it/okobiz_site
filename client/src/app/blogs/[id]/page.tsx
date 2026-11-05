"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import UniversalLoader from "@/components/UniversalLoader";
import { getBlogs } from "@/lib/api";
import { BlogItem } from "@/data/mockData";
import { renderRichText } from "@/lib/richText";

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params.id as string;

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, [blogId]);

  useEffect(() => {
    getBlogs().then((data) => {
      if (data && data.length > 0) {
        setBlogs(data);
        const match = data.find((b) => b._id === blogId || b.slug === blogId) || data[0];
        setBlog(match);
      }
    });
  }, [blogId]);

  if (!blog) {
    return <UniversalLoader fullScreen size="lg" />;
  }

  const currentShareUrl =
    shareUrl || (typeof window !== "undefined" ? window.location.href : `https://okobiz.com/blogs/${blog.slug || blog._id}`);

  const recentArticles = (
    blogs.filter((b) => b._id !== blog._id).length > 0
      ? blogs.filter((b) => b._id !== blog._id)
      : blogs
  ).slice(0, 5);

  return (
    <div className="bg-black text-white">
      <PageBanner title={blog.title} subtitle="Article & Industry Insights" />

      <section className="py-16 bg-[#141416]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Blogs</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="bg-[#181A1D] border border-gray-800 rounded-[4px] overflow-hidden shadow-2xl">
                <div className="relative h-72 sm:h-96 w-full bg-gray-900">
                  <img
                    src={blog.photo}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0167D6] text-white px-3 py-1 rounded-[4px] text-xs font-bold shadow-md">
                    {blog.category}
                  </div>
                </div>

                <div className="p-6 sm:p-10">
                  <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 border-b border-gray-800 pb-6 mb-8">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0167D6]" />
                      <span className="text-white font-medium">{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0167D6]" />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#0167D6]" />
                      <span>{blog.category}</span>
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 leading-tight">
                    {blog.title}
                  </h1>

                  {/* Rich Text Formatted Article Content */}
                  <div
                    className="prose prose-invert max-w-none text-gray-300 leading-relaxed font-light text-sm sm:text-base space-y-4 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:text-white [&_strong]:font-bold [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1.5 [&_li]:text-gray-300 [&_blockquote]:border-l-4 [&_blockquote]:border-[#0167D6] [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-gray-300 [&_blockquote]:my-4 [&_blockquote]:bg-white/5 [&_blockquote]:rounded-[4px] [&_code]:bg-[#22242a] [&_code]:text-amber-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-[2px] [&_code]:font-mono [&_code]:text-xs [&_a]:text-[#0167D6] [&_a]:underline hover:[&_a]:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: renderRichText(blog.content) }}
                  />

                  {/* Share buttons (Facebook, Twitter, WhatsApp, LinkedIn) */}
                  <div className="mt-12 pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-[#0167D6]" /> Share this article:
                    </span>
                    <div className="flex items-center gap-2.5">
                      {/* Facebook */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on Facebook"
                        title="Share on Facebook"
                        className="w-8 h-8 rounded-[4px] bg-white/5 hover:bg-[#1877F2] text-gray-300 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>

                      {/* Twitter / X */}
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent(blog.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on Twitter"
                        title="Share on Twitter"
                        className="w-8 h-8 rounded-[4px] bg-white/5 hover:bg-[#1DA1F2] text-gray-300 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${blog.title} - ${currentShareUrl}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on WhatsApp"
                        title="Share on WhatsApp"
                        className="w-8 h-8 rounded-[4px] bg-white/5 hover:bg-[#25D366] text-gray-300 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {/* LinkedIn */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentShareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on LinkedIn"
                        title="Share on LinkedIn"
                        className="w-8 h-8 rounded-[4px] bg-white/5 hover:bg-[#0A66C2] text-gray-300 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar: Exactly 5 Recent Articles */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[#181A1D] border border-gray-800 rounded-[4px] p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-gray-800 pb-3 flex items-center justify-between">
                  <span>Recent Articles</span>
                  <span className="text-[11px] font-normal text-gray-500">5 latest</span>
                </h3>

                <div className="space-y-5">
                  {recentArticles.map((item) => (
                    <Link
                      key={item._id}
                      href={`/blogs/${item.slug || item._id}`}
                      className="flex gap-4 group items-center"
                    >
                      <img
                        src={item.photo}
                        alt={item.title}
                        className="w-16 h-16 rounded-[4px] object-cover shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#0167D6] line-clamp-2 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TalkCta />
    </div>
  );
}
