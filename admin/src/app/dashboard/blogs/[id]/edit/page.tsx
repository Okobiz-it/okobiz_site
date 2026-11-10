"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BlogForm } from "@/components/blogs/BlogForm";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/blogs?id=${params.id}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        } else {
          // Fallback to slug query
          fetch(`/api/blogs?slug=${params.id}`)
            .then((r) => r.json())
            .then((bySlug) => {
              if (bySlug.success && bySlug.data) {
                setData(bySlug.data);
              } else {
                setError(resData.message || "Article not found");
              }
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
          return;
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load article");
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#0167D6] mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">
          Loading article details...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white dark:bg-[#131417] p-8 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-sm mt-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Article Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-6">
          {error || "The requested blog article could not be located."}
        </p>
        <Link
          href="/dashboard/blogs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#0167D6] text-white text-xs font-bold hover:bg-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <BlogForm initialData={data} isEdit={true} />
    </div>
  );
}

