"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Server,
  ExternalLink,
  Loader2,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cleanSnippet } from "@/lib/richText";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setServices(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch services:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also remove its details page.`)) return;
    try {
      await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      fetchServices();
    } catch (e: any) {
      alert("Failed to delete service: " + e.message);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Server className="text-[#0167D6] dark:text-[#3368B2]" size={24} />
            Services &amp; Detailed Offerings
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Manage your client /services cards and build highly customizable details pages for each offering
          </p>
        </div>
        <Link
          href="/dashboard/services/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus size={16} /> Add New Service
        </Link>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3368B2]" />
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="bg-[#131417] border border-gray-800 rounded-[6px] p-12 text-center text-gray-400 text-sm">
          <Server className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-white">No services found</p>
          <p className="text-xs text-gray-500 mt-1 mb-5">Click below to create your first service offering</p>
          <Link
            href="/dashboard/services/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] bg-[#3368B2] text-white text-xs font-bold"
          >
            <Plus size={14} /> Create Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {services.map((srv) => {
            const displayImage = srv.image || srv.bannerImage || srv.thumbnail;

            return (
              <div
                key={srv._id}
                className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[6px] overflow-hidden group hover:border-[#0167D6] dark:hover:border-[#3368B2]/60 transition shadow-xs hover:shadow-md flex flex-col justify-between h-[420px]"
              >
                {/* Media Header (Fixed aspect-video / 190px matching Portfolio & Products) */}
                <div className="h-[190px] aspect-video w-full bg-slate-100 dark:bg-black relative overflow-hidden flex items-center justify-center shrink-0">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#15171D] dark:to-[#0D0E12] flex items-center justify-center">
                      <Server className="w-12 h-12 text-[#0167D6]/60 dark:text-[#3368B2]/50" />
                    </div>
                  )}

                  {/* Top-left Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-[4px] bg-[#0167D6] text-white text-white-always text-[10px] font-bold shadow-sm">
                      ORDER #{srv.order || 1}
                    </span>
                    {srv.pricingPlans && srv.pricingPlans.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-[4px] bg-emerald-600 text-white text-white-always text-[10px] font-bold shadow-sm">
                        {srv.pricingPlans.length} {srv.pricingPlans.length === 1 ? "PLAN" : "PLANS"}
                      </span>
                    )}
                  </div>

                  {/* Bottom-right Slug Badge */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2.5 py-0.5 rounded-[4px] bg-white/95 dark:bg-black/80 text-slate-800 dark:text-gray-200 backdrop-blur-md text-[10px] font-mono font-semibold border border-slate-300/80 dark:border-white/15 shadow-sm">
                      /services/{srv.slug}
                    </span>
                  </div>
                </div>

                {/* Card Body (Flexible container with guaranteed min-height snippet) */}
                <div className="p-4 flex-1 flex flex-col justify-between min-h-0 space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400">
                      <span className="font-semibold text-[#0167D6] dark:text-[#3368B2] tracking-wider uppercase text-[10px]">
                        Service Offering
                      </span>
                      <a
                        href={`http://localhost:3000/services/${srv.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0167D6] dark:text-[#3368B2] hover:underline flex items-center gap-1 text-[11px] font-medium"
                      >
                        <span>Preview</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0167D6] transition">
                      {srv.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {cleanSnippet(srv.shortDesc, 110) || (
                        <span className="italic text-slate-400 dark:text-gray-600">No short description set</span>
                      )}
                    </p>
                  </div>

                  {/* Highlights overview */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-gray-800/80 text-[11px] text-slate-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Layers size={13} className="text-[#0167D6] dark:text-[#3368B2]" />
                      <span>{srv.features?.length || 0} Features</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-emerald-600 dark:text-emerald-500" />
                      <span>{srv.whyChooseUs?.length || 0} Why Choose</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions (Fixed height h-[52px]) */}
                <div className="p-3.5 bg-slate-50/80 dark:bg-[#181A1F]/80 border-t border-slate-200 dark:border-gray-800/80 flex items-center justify-between shrink-0 h-[52px]">
                  <a
                    href={`http://localhost:3000/services/${srv.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-[#0167D6] dark:text-gray-400 dark:hover:text-white transition font-medium"
                  >
                    <ArrowRight size={13} className="text-[#0167D6] dark:text-[#3368B2]" />
                    <span>View Details</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/services/${srv._id || srv.slug}/edit`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-slate-100 dark:bg-white/5 hover:bg-[#0167D6] hover:text-white text-slate-700 dark:text-gray-300 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-transparent transition"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(srv._id, srv.title)}
                      className="p-1.5 rounded-[4px] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-transparent transition cursor-pointer"
                      title="Delete service"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
