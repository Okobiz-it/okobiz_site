"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Package,
  BookOpen,
  FolderOpen,
  MessageSquare,
  Sliders,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    clients: 0,
    themes: 0,
    products: 0,
    blogs: 0,
    media: 0,
    inquiries: 0,
    newInquiries: 0,
    heroSlides: 0,
  });
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then(r => r.json()),
      fetch("/api/inquiries").then(r => r.json()),
      fetch("/api/hero").then(r => r.json())
    ]).then(([statsRes, inqRes, heroRes]) => {
      if (statsRes.success) setStats(statsRes.data);
      if (inqRes.success) setInquiries(inqRes.data.slice(0, 5));
      if (heroRes.success) setHeroSlides(heroRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { title: "Products & SaaS", count: stats.products || 0, icon: Package, href: "/dashboard/products", color: "from-blue-600 to-cyan-600" },
    { title: "Client Partners", count: stats.clients, icon: Users, href: "/dashboard/clients", color: "from-blue-600 to-indigo-600" },
    { title: "Portfolio Projects", count: stats.themes, icon: Briefcase, href: "/dashboard/portfolio", color: "from-indigo-600 to-purple-600" },
    { title: "Blog Articles", count: stats.blogs, icon: BookOpen, href: "/dashboard/blogs", color: "from-emerald-600 to-teal-600" },
    { title: "Media Assets", count: stats.media, icon: FolderOpen, href: "/dashboard/media", color: "from-amber-600 to-orange-600" },
    { title: "Customer Leads", count: stats.inquiries, badge: stats.newInquiries ? `${stats.newInquiries} new` : null, icon: MessageSquare, href: "/dashboard/inquiries", color: "from-rose-600 to-pink-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="admin-welcome-banner relative overflow-hidden rounded-[4px] bg-gradient-to-r from-[#0167D6] via-[#1D4ED8] to-[#1E3A8A] dark:from-[#18263D] dark:via-[#131417] dark:to-[#131417] p-6 sm:p-8 border border-blue-600/30 dark:border-blue-900/30 shadow-md">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs uppercase font-bold tracking-widest text-white px-3 py-1 bg-white/20 dark:bg-blue-900/30 dark:text-[#3368B2] rounded-[4px] inline-block mb-3 border border-white/30 dark:border-blue-800/40 text-white-always">
            Control Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-white-always">
            Welcome to okobiz Admin
          </h1>
          <p className="text-blue-100 dark:text-gray-400 text-sm mt-2 leading-relaxed">
            Manage your corporate web presentation, client portfolio, products, blogs, and multimedia assets with instant live synchronization.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/portfolio"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-white dark:bg-[#3368B2] text-[#0167D6] dark:text-white hover:bg-blue-50 dark:hover:bg-blue-600 text-xs font-bold transition shadow-md"
            >
              <Plus size={16} /> Add Portfolio Project
            </Link>
            <Link
              href="/dashboard/media"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/15 text-white text-xs font-bold border border-white/25 dark:border-white/10 transition text-white-always"
            >
              <FolderOpen size={16} /> Upload Media
            </Link>
            <Link
              href="/dashboard/blogs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/15 text-white text-xs font-bold border border-white/25 dark:border-white/10 transition text-white-always"
            >
              <Plus size={16} /> Write Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className="bg-white dark:bg-[#131417] hover:bg-slate-50 dark:hover:bg-[#181A1F] border border-slate-200 dark:border-gray-800/80 hover:border-slate-300 dark:hover:border-gray-700 p-5 rounded-[4px] transition duration-200 group flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-[4px] bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-white-always shadow-md`}>
                  <Icon size={18} className="text-white text-white-always" />
                </div>
                {card.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-[#0167D6] transition">
                  {loading ? "-" : card.count}
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-gray-400 mt-0.5">
                  {card.title}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two columns: Recent Inquiries & Live Hero Slides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800/80 rounded-[4px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={18} className="text-[#3368B2]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Customer Inquiries</h2>
            </div>
            <Link
              href="/dashboard/inquiries"
              className="text-xs text-[#3368B2] hover:text-blue-500 dark:hover:text-blue-400 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-gray-500 text-xs">
              No inquiries received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq._id}
                  className="p-3.5 rounded-[4px] bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800/60 flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{inq.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-[4px] font-bold uppercase ${
                        inq.status === 'new' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        inq.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">{inq.service} - {inq.email}</p>
                  </div>
                  <Link
                    href="/dashboard/inquiries"
                    className="text-xs px-3 py-1 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-medium shrink-0 transition"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Hero Slides */}
        <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800/80 rounded-[4px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Sliders size={18} className="text-[#3368B2]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Hero Slides</h2>
            </div>
            <Link
              href="/dashboard/hero"
              className="text-xs text-[#3368B2] hover:text-blue-500 dark:hover:text-blue-400 font-semibold flex items-center gap-1"
            >
              <span>Manage Slides</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {heroSlides.slice(0, 4).map((slide, idx) => (
              <div
                key={slide._id || idx}
                className="p-3 rounded-[4px] bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800/60 flex items-center gap-3.5"
              >
                <div className="w-14 h-10 rounded-[4px] overflow-hidden bg-black shrink-0 relative">
                  <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{slide.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate mt-0.5">Order #{slide.order} • Button: {slide.buttonText}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-[4px] font-bold ${
                  slide.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-200 dark:bg-gray-500/10 text-slate-600 dark:text-gray-400'
                }`}>
                  {slide.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
