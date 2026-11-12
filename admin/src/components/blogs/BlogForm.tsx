"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Save,
  Loader2,
  UploadCloud,
  ImageIcon,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  User,
  CheckCircle2,
  Globe
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { createSlug } from "@/lib/slug";
import { toast } from "@/lib/toast";

export interface BlogFormData {
  _id?: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  photo: string;
  content: string;
  isPublished: boolean;
}

const DEFAULT_BLOG_FORM: BlogFormData = {
  title: "",
  slug: "",
  category: "Web Development",
  author: "Md. Sorower Jahan",
  photo: "/assets/website-app-DOXr3sR7.webp",
  content: "",
  isPublished: true,
};

const BLOG_CATEGORIES = [
  "Web Development",
  "Enterprise Software & SaaS",
  "Cloud & DevOps",
  "Artificial Intelligence & ML",
  "Mobile App Development",
  "FinTech & POS Systems",
  "Digital Strategy & Growth",
  "Security & Infrastructure",
  "Design & User Experience"
];

interface BlogFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<BlogFormData>(DEFAULT_BLOG_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        _id: initialData._id,
        title: initialData.title || "",
        slug: initialData.slug || createSlug(initialData.title || ""),
        category: initialData.category || "Web Development",
        author: initialData.author || "Md. Sorower Jahan",
        photo: initialData.photo || "/assets/website-app-DOXr3sR7.webp",
        content: initialData.content || "",
        isPublished: initialData.isPublished !== undefined ? Boolean(initialData.isPublished) : true,
      });
    }
  }, [initialData]);

  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      const updates: Partial<BlogFormData> = { title: val };
      if (!isEdit || !prev.slug || prev.slug === createSlug(prev.title)) {
        updates.slug = createSlug(val);
      }
      return { ...prev, ...updates };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((f) => ({ ...f, photo: data.url }));
        toast.success("Cover image uploaded successfully!");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error("Network upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please provide an article title");
      return;
    }

    const finalSlug = createSlug(form.slug || form.title || "article");
    if (!finalSlug) {
      toast.error("Please provide a valid slug");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEdit ? "Updating article..." : "Publishing article...");

    const payload = {
      ...form,
      title: form.title.trim(),
      slug: finalSlug,
      author: form.author.trim() || "okobiz Editorial",
    };

    try {
      let res: Response;
      if (isEdit && form._id) {
        res = await fetch("/api/blogs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: form._id, ...payload }),
        });
      } else {
        res = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      toast.dismiss(toastId);

      if (!res.ok || !resData.success) {
        toast.error(resData.message || "Failed to save article");
        return;
      }

      toast.success(isEdit ? "Article updated successfully!" : "Article published successfully!");
      router.push("/dashboard/blogs");
      router.refresh();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Sticky Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#131417] p-4 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/blogs"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>
          <div className="h-5 w-px bg-slate-200 dark:bg-gray-800 hidden sm:block" />
          <div className="min-w-0">
            <h1
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate max-w-[280px] sm:max-w-md lg:max-w-xl"
              title={isEdit ? `Edit Article: ${form.title || "Untitled"}` : "Write New Article"}
            >
              <BookOpen className="w-5 h-5 text-[#0167D6] shrink-0" />
              <span className="truncate">{isEdit ? `Edit Article: ${form.title || "Untitled"}` : "Write New Article"}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Link
            href="/dashboard/blogs"
            className="px-4 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </Link>

          {isEdit && form.slug && (
            <a
              href={`http://localhost:3000/blogs/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[4px] border border-blue-200 dark:border-blue-800 text-[#0167D6] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            >
              <ExternalLink size={13} /> View Live Article
            </a>
          )}

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{isEdit ? "Update Article" : "Publish Article"}</span>
          </button>
        </div>
      </div>

      {/* Unified Master Card: Left Content & Right Metadata in the SAME BOX */}
      <div className="bg-white dark:bg-[#131417] rounded-[6px] border border-slate-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-gray-800">
          {/* Left Column (8 cols): Article Title, Slug & Full Article Editor */}
          <div className="lg:col-span-8 p-6 lg:p-7 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Article Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Scaling Modern Multi-Tenant Web Applications in 2026"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                URL Slug (/blogs/slug)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="scaling-modern-multi-tenant-web-applications"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, slug: createSlug(form.title) })}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-[4px] text-xs font-semibold hover:bg-slate-200 dark:hover:bg-gray-700 transition"
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Article Content *
              </label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Draft your comprehensive article with headings, code snippets, lists, blockquotes, and links..."
                minHeight="min-h-[460px]"
              />
            </div>
          </div>

          {/* Right Column (4 cols): Publishing Settings & Cover Image */}
          <div className="lg:col-span-4 p-6 lg:p-7 bg-slate-50/50 dark:bg-[#15171B]/50 space-y-7">
            {/* Section: Publishing Settings */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Globe size={15} className="text-[#0167D6]" /> Publishing Settings
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Publication Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isPublished: true })}
                    className={`py-2 px-3 rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                      form.isPublished
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <CheckCircle2 size={14} /> Published
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isPublished: false })}
                    className={`py-2 px-3 rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                      !form.isPublished
                        ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : "border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    Draft Only
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Md. Sorower Jahan or okobiz Tech Team"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>
            </div>

            {/* Section: Featured Cover Photo */}
            <div className="pt-6 border-t border-slate-200 dark:border-gray-800 space-y-4">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={15} className="text-[#0167D6]" /> Featured Cover Photo
              </h2>

              <div className="border-2 border-dashed border-slate-300 dark:border-gray-700 rounded-[4px] p-3 text-center bg-white dark:bg-[#18191D]">
                {form.photo ? (
                  <div className="relative group rounded-[4px] overflow-hidden max-h-52 bg-slate-900 flex items-center justify-center">
                    <img src={form.photo} alt="Cover Preview" className="object-cover max-h-52 w-full" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, photo: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-[4px] opacity-0 group-hover:opacity-100 transition shadow"
                      title="Remove Image"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <ImageIcon className="mx-auto text-slate-400 dark:text-gray-600 mb-2" size={32} />
                    <p className="text-xs text-slate-500 dark:text-gray-400">No cover photo set</p>
                  </div>
                )}

                <div className="mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={14} />}
                    <span>{uploading ? "Uploading..." : form.photo ? "Change Cover Image" : "Upload Cover Image"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

